const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Authorization, Content-Type',
}));

const connectionDB = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'maria2210',
    database: 'project_tables'
});

connectionDB.connect(err => {
    if (err) {
        return console.error('Error connecting: ' + err.stack);
    }
    console.log('Connected as id ' + connectionDB.threadId);
});

app.get('/', (req, res) => {
    res.send('Welcome to the User Management API');
});


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage });
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.status(200).json({ imagePath: `uploads/${req.file.filename}` });
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/users', (req, res) => {
    connectionDB.query('SELECT * FROM users', (error, results) => {
        if (error) {
            console.error("Error fetching users:", error);
            return res.status(500).send("Internal Server Error");
        }
        res.status(200).json(results);
    });
});

app.post('/users', (req, res) => {
    const { first_name, last_name, email, password_, phone_number, skills, city, address, gun_license, gun_license_file1, gun_license_file2, gender} = req.body;
    console.log("Received request to add user:", req.body);

    const query = 'INSERT INTO users (first_name, last_name, email, password_, phone_number, skills, gender) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connectionDB.query(query, [first_name, last_name, email, password_, phone_number, skills, gender], (error, results) => {
        if (error) {
            console.error("Error inserting user:", error);
            return res.status(500).send("Internal Server Error");
        }

        const userId = results.insertId;
        console.log("User inserted with ID:", userId);

        const addressQuery = 'INSERT INTO addresses (user_id, city, address) VALUES (?, ?, ?)';
        connectionDB.query(addressQuery, [userId, city, address], (error, results) => {
            if (error) {
                console.error("Error inserting address:", error);
                return res.status(500).send("Internal Server Error");
            }

            const gunLicenseQuery = 'INSERT INTO gunlicenses (user_id, gun_license, gun_license_file1, gun_license_file2) VALUES (?, ?, ?, ?)';
            connectionDB.query(gunLicenseQuery, [userId, gun_license, gun_license_file1, gun_license_file2], (error, results) => {
                if (error) {
                    console.error("Error inserting gun license:", error);
                    return res.status(500).send("Internal Server Error");
                }
                const profileQuery = 'INSERT INTO profile (user_id) VALUES (?)';
                connectionDB.query(profileQuery, [userId], (error, results) => {
                    if (error) {
                        console.error("Error inserting profile:", error);
                        return res.status(500).send("Internal Server Error");
                    }
                    console.log("User, address, gun license, and profile added successfully:", results);
                    res.status(201).send("User added successfully");
                });
            });
        });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log("Received login request for user:", email);

    const query = 'SELECT * FROM users WHERE email = ? AND password_ = ?';
    connectionDB.query(query, [email, password], (error, results) => {
        if (error) {
            console.error("Error fetching user:", error);
            return res.status(500).send("Internal Server Error");
        }
        console.log("Query results:", results);

        if (results.length > 0) {
            const user = results[0];
            console.log("User authenticated successfully:", user);
            res.status(200).json({ userId: user.user_id, message: "Login successful" });
        } else {
            console.log("שם משתמש או סיסמה לא נכונים");
            res.status(401).json({ message: "שם משתמש או סיסמה לא נכונים" });
        }
    });
});

app.get('/login', (req, res) => {
    connectionDB.query('SELECT email, password_ FROM users', (error, results) => {
        if (error) {
            console.error("Error fetching login details:", error);
            return res.status(500).send("Internal Server Error");
        }
        res.status(200).json(results);
    });
});

app.get('/user/profile', (req, res) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(400).send("No authorization header provided");
    }

    const userId = authorizationHeader.split(' ')[1];

    if (!userId) {
        return res.status(400).send("No user ID provided");
    }

    const query = `
        SELECT u.*, a.city, a.address, p.reminders_enabled, p.notifications_enabled, p.help_enabled, p.profile_image, 
            (SELECT COUNT(*) FROM calls WHERE user_id = u.user_id AND status != 'טופל') AS open_calls,
            (SELECT COUNT(*) FROM calls WHERE responded_by_user_id = u.user_id) AS calls_responded,
            (SELECT COUNT(*) FROM calls WHERE user_id = u.user_id) AS calls_I_opened,
            (SELECT AVG(star_rating) FROM opinions WHERE user_id = u.user_id) AS avg_star_rating,
            (SELECT AVG(simple_rating) FROM opinions WHERE user_id = u.user_id) AS avg_simple_rating
        FROM users u 
        LEFT JOIN addresses a ON u.user_id = a.user_id 
        LEFT JOIN profile p ON u.user_id = p.user_id
        WHERE u.user_id = ?
    `;

    connectionDB.query(query, [userId], (error, results) => {
        if (error) {
            console.error("Error fetching user data:", error);
            return res.status(500).send("Internal Server Error");
        }
        if (results.length > 0) {
            const user = results[0];
            res.status(200).json(user);
        } else {
            res.status(404).send("User not found");
        }
    });
});

app.post('/calls' , upload.single('image'), (req, res) => {
    const { user_id, category, urgency, current_location, description, img } = req.body;
    console.log("Received request to add call:", req.body);


    const query = 'INSERT INTO calls (user_id, category, urgency, current_location, description, img, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connectionDB.query(query, [user_id, category, urgency, current_location, description, img, 'לא נענו לקריאה'], (error, results) => {
        if (error) {
            console.error("Error inserting call:", error);
            return res.status(500).send("Internal Server Error");
        }
        console.log("Call added successfully:", results);

        const updateProfileQuery = `
            UPDATE profile 
            SET open_calls = (SELECT COUNT(*) FROM calls WHERE user_id = ? AND status != 'טופל'),
                calls_I_opened = (SELECT COUNT(*) FROM calls WHERE user_id = ?)
            WHERE user_id = ?
        `;
        connectionDB.query(updateProfileQuery, [user_id, user_id, user_id], (error, updateResults) => {
            if (error) {
                console.error("Error updating profile calls_opened:", error);
                return res.status(500).send("Internal Server Error");
            }
            console.log("Profile updated successfully:", updateResults);
            res.status(201).send("Call added and profile updated successfully");
        });
    });
});


app.get('/calls', (req, res) => {
    const query = `
        SELECT c.*, 
               u.first_name, u.last_name, u.phone_number,
               gu.full_name AS guest_full_name, gu.phone AS guest_phone,
               cr.user_id AS responded_user_id, ru.first_name AS responded_first_name, ru.last_name AS responded_last_name
        FROM calls c 
        LEFT JOIN users u ON c.user_id = u.user_id
        LEFT JOIN guestusers gu ON c.guest_user_id = gu.guest_user_id
        LEFT JOIN call_responses cr ON c.call_id = cr.call_id
        LEFT JOIN users ru ON cr.user_id = ru.user_id
        WHERE c.status != 'טופל'
    `;

    connectionDB.query(query, (error, results) => {
        if (error) {
            console.error("Error fetching calls:", error);
            return res.status(500).send("Internal Server Error");
        }

        const callsMap = {};
        results.forEach(row => {
            if (!callsMap[row.call_id]) {
                callsMap[row.call_id] = {
                    ...row,
                    responded_users: []
                };
            }
            if (row.responded_user_id) {
                callsMap[row.call_id].responded_users.push({
                    user_id: row.responded_user_id,
                    first_name: row.responded_first_name,
                    last_name: row.responded_last_name
                });
            }
        });

        const finalResults = Object.values(callsMap);
        res.status(200).json(finalResults);
    });
});



app.get('/call/:callId', (req, res) => {
    const { callId } = req.params;
    console.log(`Fetching call details for callId: ${callId}`); // הודעת קונסולה כדי לוודא שהבקשה מתקבלת עם callId הנכון
    const query = 'SELECT * FROM calls WHERE call_id = ?';
    connectionDB.query(query, [callId], (error, results) => {
        if (error) {
            console.error("Error fetching call details:", error);
            return res.status(500).send("Internal Server Error");
        }
        if (results.length > 0) {
            results[0].img = results[0].img ? `http://192.168.1.72:8003/${results[0].img}` : null;
            console.log('Returning call details with image:', results[0].img); // הודעת קונסולה
            res.status(200).json(results[0]);
        } else {
            console.log('Call not found for callId:', callId); // הודעת קונסולה אם לא נמצאה קריאה עם callId הנתון
            res.status(404).send("Call not found");
        }
    });
});



app.post('/guest-calls', async (req, res) => {
    const { full_name, phone, category, urgency, current_location, description, img } = req.body;

    try {
        // הוספת אורח חדש
        const guestResult = await new Promise((resolve, reject) => {
            connectionDB.query('INSERT INTO guestusers (full_name, phone) VALUES (?, ?)',
                [full_name, phone],
                (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                });
        });

        const guest_user_id = guestResult.insertId;

        // הוספת קריאה עם ה-ID של האורח החדש
        const callResult = await new Promise((resolve, reject) => {
            connectionDB.query(
                'INSERT INTO calls (guest_user_id, category, urgency, current_location, description, img, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [guest_user_id, category, urgency, current_location, description, img, 'לא נענו לקריאה'],
                (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                }
            );
        });

        res.status(201).json({ message: 'הקריאה נפתחה בהצלחה', call_id: callResult.insertId });
    } catch (error) {
        console.error('Error opening the call:', error);
        res.status(500).json({ error: 'Failed to open the call.' });
    }
});
app.get('/user/responded-calls', (req, res) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(400).send("No authorization header provided");
    }

    const userId = authorizationHeader.split(' ')[1];

    if (!userId) {
        return res.status(400).send("No user ID provided");
    }

    const query = `
        SELECT c.*, 
               u.first_name, u.last_name, u.phone_number,
               gu.full_name AS guest_full_name, gu.phone AS guest_phone
        FROM calls c 
        LEFT JOIN users u ON c.user_id = u.user_id
        LEFT JOIN guestusers gu ON c.guest_user_id = gu.guest_user_id
        WHERE c.responded_by_user_id = ?
    `;
    connectionDB.query(query, [userId], (error, results) => {
        if (error) {
            console.error("Error fetching responded calls:", error);
            return res.status(500).send("Internal Server Error");
        }
        res.status(200).json(results);
    });
});

app.get('/user/responded-open-calls', (req, res) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(400).send("No authorization header provided");
    }

    const userId = authorizationHeader.split(' ')[1];

    if (!userId) {
        return res.status(400).send("No user ID provided");
    }

    const query = `
        SELECT c.*, 
               u.first_name, u.last_name, u.phone_number,
               gu.full_name AS guest_full_name, gu.phone AS guest_phone
        FROM calls c 
        LEFT JOIN users u ON c.user_id = u.user_id
        LEFT JOIN guestusers gu ON c.guest_user_id = gu.guest_user_id
        WHERE c.responded_by_user_id = ? AND c.status != 'טופל'
    `;
    connectionDB.query(query, [userId], (error, results) => {
        if (error) {
            console.error("Error fetching responded open calls:", error);
            return res.status(500).send("Internal Server Error");
        }
        res.status(200).json(results);
    });
});

app.get('/user/open-calls', (req, res) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(400).send("No authorization header provided");
    }

    const userId = authorizationHeader.split(' ')[1];

    if (!userId) {
        return res.status(400).send("No user ID provided");
    }

    const query = `
        SELECT c.*, 
               u.first_name, u.last_name, u.phone_number,
               gu.full_name AS guest_full_name, gu.phone AS guest_phone,
               ru.user_id AS responded_user_id, ru.first_name AS responded_first_name, ru.last_name AS responded_last_name
        FROM calls c 
        LEFT JOIN users u ON c.user_id = u.user_id
        LEFT JOIN guestusers gu ON c.guest_user_id = gu.guest_user_id
        LEFT JOIN users ru ON c.responded_by_user_id = ru.user_id
        WHERE c.status != 'טופל' AND c.user_id = ?
    `;
    connectionDB.query(query, [userId], (error, results) => {
        if (error) {
            console.error("Error fetching open calls:", error);
            return res.status(500).send("Internal Server Error");
        }
        res.status(200).json(results);
    });
});

app.get('/user/completed-calls-count', (req, res) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(400).send("No authorization header provided");
    }

    const userId = authorizationHeader.split(' ')[1];

    if (!userId) {
        return res.status(400).send("No user ID provided");
    }

    const query = `
        SELECT COUNT(*) AS completed_calls_count 
        FROM calls 
        WHERE responded_by_user_id = ? AND status = 'טופל'
    `;
    connectionDB.query(query, [userId], (error, results) => {
        if (error) {
            console.error("Error fetching completed calls count:", error);
            return res.status(500).send("Internal Server Error");
        }
        res.status(200).json(results[0]);
    });
});

app.get('/user/open-calls-count', (req, res) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
        return res.status(400).send("No authorization header provided");
    }

    const userId = authorizationHeader.split(' ')[1];

    if (!userId) {
        return res.status(400).send("No user ID provided");
    }

    const query = `
        SELECT COUNT(*) AS open_calls_count 
        FROM calls 
        WHERE user_id = ? AND status != 'טופל'
    `;
    connectionDB.query(query, [userId], (error, results) => {
        if (error) {
            console.error("Error fetching open calls count:", error);
            return res.status(500).send("Internal Server Error");
        }
        res.status(200).json(results[0]);
    });
});

app.get('/user/completed-opened-calls', (req, res) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(400).send("No authorization header provided");
    }

    const userId = authorizationHeader.split(' ')[1];

    if (!userId) {
        return res.status(400).send("No user ID provided");
    }

    const query = `
        SELECT c.*, 
               u.first_name, u.last_name, u.phone_number,
               gu.full_name AS guest_full_name, gu.phone AS guest_phone
        FROM calls c 
        LEFT JOIN users u ON c.user_id = u.user_id
        LEFT JOIN guestusers gu ON c.guest_user_id = gu.guest_user_id
        WHERE c.user_id = ? AND c.status = 'טופל'
    `;
    connectionDB.query(query, [userId], (error, results) => {
        if (error) {
            console.error("Error fetching completed opened calls:", error);
            return res.status(500).send("Internal Server Error");
        }
        res.status(200).json(results);
    });
});


app.get('/user/completed-calls', (req, res) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(400).send("No authorization header provided");
    }

    const userId = authorizationHeader.split(' ')[1];

    if (!userId) {
        return res.status(400).send("No user ID provided");
    }

    const query = `
        SELECT c.*, 
               u.first_name, u.last_name, u.phone_number,
               gu.full_name AS guest_full_name, gu.phone AS guest_phone
        FROM calls c 
        LEFT JOIN users u ON c.user_id = u.user_id
        LEFT JOIN guestusers gu ON c.guest_user_id = gu.guest_user_id
        WHERE c.responded_by_user_id = ? AND c.status = 'טופל'
    `;
    connectionDB.query(query, [userId], (error, results) => {
        if (error) {
            console.error("Error fetching completed calls:", error);
            return res.status(500).send("Internal Server Error");
        }
        res.status(200).json(results);
    });
});

app.post('/update-call-status', (req, res) => {
    const { call_id, status, user_id } = req.body;
    console.log(`Updating call status for call_id: ${call_id}, status: ${status}, user_id: ${user_id}`);
    const query = 'UPDATE calls SET status = ?, responded_by_user_id = ? WHERE call_id = ?';
    connectionDB.query(query, [status, user_id, call_id], (error, results) => {
        if (error) {
            console.error("Error updating call status:", error);
            return res.status(500).send("Internal Server Error");
        }
        console.log(`Call status updated successfully for call_id: ${call_id}`);

        // Update the user's responded calls count
        const updateProfileQuery = `
            UPDATE profile 
            SET calls_responded = (SELECT COUNT(*) FROM calls WHERE responded_by_user_id = ?),
                open_calls = (SELECT COUNT(*) FROM calls WHERE user_id = ? AND status != 'טופל'),
                calls_I_opened = (SELECT COUNT(*) FROM calls WHERE user_id = ?)
            WHERE user_id = ?
        `;
        connectionDB.query(updateProfileQuery, [user_id, user_id, user_id, user_id], (error, updateResults) => {
            if (error) {
                console.error("Error updating profile:", error);
                return res.status(500).send("Internal Server Error");
            }
            console.log(`Profile updated successfully for user_id: ${user_id}`);
            res.status(200).send("Call status updated and profile updated successfully");
        });
    });
});




app.post('/user/update-profile-image', upload.single('profile_image'), (req, res) => {
    const userId = req.headers.authorization.split(' ')[1];
    const profileImagePath = req.file.path;

    if (!profileImagePath) {
        return res.status(400).send("No profile image provided");
    }

    const query = 'UPDATE profile SET profile_image = ? WHERE user_id = ?';
    connectionDB.query(query, [profileImagePath, userId], (error, results) => {
        if (error) {
            console.error("Error updating profile image:", error);
            return res.status(500).send("Internal Server Error");
        }
        res.status(200).send({ imagePath: `http://192.168.1.72:8003/${profileImagePath}` });
    });
});

app.post('/user/remove-profile-image', (req, res) => {
    const userId = req.headers.authorization.split(' ')[1];

    const query = 'UPDATE profile SET profile_image = NULL WHERE user_id = ?';
    connectionDB.query(query, [userId], (error, results) => {
        if (error) {
            console.error("Error removing profile image:", error);
            return res.status(500).send("Internal Server Error");
        }
        res.status(200).send("Profile image removed successfully");
    });
});

// נתיב לקבלת תמונת פרופיל
app.get('/user/profile-image', (req, res) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(400).send("No authorization header provided");
    }

    const userId = authorizationHeader.split(' ')[1];

    if (!userId) {
        return res.status(400).send("No user ID provided");
    }

    const query = 'SELECT profile_image FROM profile WHERE user_id = ?';
    connectionDB.query(query, [userId], (error, results) => {
        if (error) {
            console.error("Error fetching profile image:", error);
            return res.status(500).send("Internal Server Error");
        }

        if (results.length > 0) {
            const profileImagePath = results[0].profile_image;
            if (profileImagePath) {
                res.sendFile(path.resolve(profileImagePath));
            } else {
                res.status(404).send("Profile image not found");
            }
        } else {
            res.status(404).send("Profile image not found");
        }
    });
});

app.post('/user/update-settings', (req, res) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(400).send("No authorization header provided");
    }

    const userId = authorizationHeader.split(' ')[1];

    if (!userId) {
        return res.status(400).send("No user ID provided");
    }

    const { remindersEnabled, notificationsEnabled, helpEnabled } = req.body;

    const query = 'UPDATE profile SET reminders_enabled = ?, notifications_enabled = ?, help_enabled = ? WHERE user_id = ?';
    connectionDB.query(query, [remindersEnabled, notificationsEnabled, helpEnabled, userId], (error, results) => {
        if (error) {
            console.error("Error updating settings:", error);
            return res.status(500).send("Internal Server Error");
        }
        res.status(200).send("Settings updated successfully");
    });
});
app.post('/user/update-profile', (req, res) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(400).send("No authorization header provided");
    }

    const userId = authorizationHeader.split(' ')[1];

    if (!userId) {
        return res.status(400).send("No user ID provided");
    }

    const { email, city, address } = req.body;

    const userQuery = 'UPDATE users SET email = ? WHERE user_id = ?';
    connectionDB.query(userQuery, [email, userId], (error, results) => {
        if (error) {
            console.error("Error updating user email:", error);
            return res.status(500).send("Internal Server Error");
        }

        // Check if address already exists for the user
        const checkAddressQuery = 'SELECT * FROM addresses WHERE user_id = ?';
        connectionDB.query(checkAddressQuery, [userId], (error, results) => {
            if (error) {
                console.error("Error checking address:", error);
                return res.status(500).send("Internal Server Error");
            }

            let addressQuery;
            if (results.length > 0) {
                // Update the existing address
                addressQuery = 'UPDATE addresses SET city = ?, address = ? WHERE user_id = ?';
            } else {
                // Insert a new address
                addressQuery = 'INSERT INTO addresses (city, address, user_id) VALUES (?, ?, ?)';
            }

            connectionDB.query(addressQuery, [city, address, userId], (error, results) => {
                if (error) {
                    console.error("Error updating or inserting address:", error);
                    return res.status(500).send("Internal Server Error");
                }
                res.status(200).send("User profile updated successfully");
            });
        });
    });
});

app.get('/user/settings', (req, res) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(400).send("No authorization header provided");
    }

    const userId = authorizationHeader.split(' ')[1];

    if (!userId) {
        return res.status(400).send("No user ID provided");
    }

    const query = 'SELECT reminders_enabled, notifications_enabled, help_enabled FROM profile WHERE user_id = ?';
    connectionDB.query(query, [userId], (error, results) => {
        if (error) {
            console.error("Error fetching settings:", error);
            return res.status(500).send("Internal Server Error");
        }

        if (results.length > 0) {
            const settings = results[0];
            res.status(200).json(settings);
        } else {
            res.status(404).send("Settings not found");
        }
    });
});



app.get('/user/completed-opened-calls-count', (req, res) => {
    console.log('Request received for completed opened calls count');
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(400).send("No authorization header provided");
    }

    const userId = authorizationHeader.split(' ')[1];

    if (!userId) {
        return res.status(400).send("No user ID provided");
    }

    const query = `
        SELECT COUNT(*) AS completed_opened_calls_count 
        FROM calls 
        WHERE user_id = ? AND status = 'טופל'
    `;
    connectionDB.query(query, [userId], (error, results) => {
        if (error) {
            console.error("Error fetching completed opened calls count:", error);
            return res.status(500).send("Internal Server Error");
        }
        console.log('Completed opened calls count:', results[0].completed_opened_calls_count); // הוסף בדיקת קונסולה
        res.status(200).json(results[0]);
    });
});




app.get('/user/opinions', (req, res) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(400).send("No authorization header provided");
    }

    const userId = authorizationHeader.split(' ')[1];

    if (!userId) {
        return res.status(400).send("No user ID provided");
    }

    const query = `
        SELECT star_rating, simple_rating, report_text 
        FROM opinions 
        WHERE user_id = ?
    `;

    connectionDB.query(query, [userId], (error, results) => {
        if (error) {
            console.error("Error fetching user opinions:", error);
            return res.status(500).send("Internal Server Error");
        }
        res.status(200).json(results);
    });
});

app.post('/opinions', (req, res) => {
    const { call_id, user_id, user_type, star_rating, simple_rating, report_text } = req.body;
    console.log("Received request to add opinion:", req.body);

    console.log("call_id:", call_id);
    console.log("user_id:", user_id);
    console.log("user_type:", user_type);
    console.log("star_rating:", star_rating);
    console.log("simple_rating:", simple_rating);
    console.log("report_text:", report_text);

    if (!call_id || !user_id || !user_type || star_rating === undefined || simple_rating === undefined) {
        console.error("Missing required fields");
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'INSERT INTO opinions (call_id, user_id, user_type, star_rating, simple_rating, report_text) VALUES (?, ?, ?, ?, ?, ?)';
    connectionDB.query(query, [call_id, user_id, user_type, star_rating, simple_rating, report_text], (error, results) => {
        if (error) {
            console.error("Error inserting opinion:", error);
            return res.status(500).send("Internal Server Error");
        }
        console.log("RatingByVolunteer added successfully:", results);
        res.status(201).send("RatingByVolunteer added successfully");
    });
});

app.get('/opinions', (req, res) => {
    connectionDB.query('SELECT * FROM opinions', (error, results) => {
        if (error) {
            console.error("Error fetching opinion:", error);
            return res.status(500).send("Internal Server Error");
        }
        res.status(200).json(results);
    });
});

app.listen(8003, () => {
    console.log('Server is running on http://localhost:8003');
});
