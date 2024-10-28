const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const session = require('express-session');
const app = express();
const port = 3000;
const url = 'mongodb://localhost:27017';
const dbName = 'BinPaste';

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));


app.use(express.json()); 


app.use(express.static(__dirname));

app.post('/notes', async (req, res) => {
    const { title, content, color } = req.body;
    const client = new MongoClient(url);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('notes');

        
        const username = req.session.user ? req.session.user.username : 'Guest';

        const note = {
            title,
            content,
            color,
            postedBy: username, 
            createdAt: new Date() 
        };

        const result = await collection.insertOne(note);
        console.log('Note saved.', result);
        res.status(201).send('Note saved successfully!.');
    } catch (err) {
        console.error('Error', err);
        res.status(500).send('Eroare la salvarea notei');
    } finally {
        await client.close();
    }
});


app.get('/notes', async (req, res) => {
    const { page = 1, limit = 12, search = '' } = req.query;
    const client = new MongoClient(url);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('notes');

        const query = search
            ? {
                  $or: [
                      { title: { $regex: search, $options: 'i' } },
                      { content: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

        const totalNotes = await collection.countDocuments(query);

        const notes = await collection.find(query)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .toArray();

        res.json({ 
            notes, 
            totalNotes 
        });
    } catch (err) {
        console.error('Eroare la preluarea notelor:', err);
        res.status(500).send('Eroare la preluarea notelor');
    } finally {
        await client.close();
    }
});


app.post('/auth/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (username.length > 15) {
        return res.status(400).json({ message: 'Username cannot exceed 15 characters.' });
    }

    if (/\s/.test(username)) {
        return res.status(400).json({ error: 'Username cannot contain any spaces.' });
    }

    const client = new MongoClient(url);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('users');

        
        const existingUser = await collection.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Acest username este deja folosit.' });
        }

        
        const existingEmail = await collection.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Acest email este deja folosit.' });
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);

        
        const newUser = {
            username,
            email,
            password: hashedPassword,
            createdAt: new Date() 
        };
        await collection.insertOne(newUser);

        
        req.session.user = {
            username: newUser.username
        };

        res.status(201).json({ message: 'Contul tău a fost creat cu succes!' });
    } catch (err) {
        console.error('Eroare la înregistrare:', err);
        res.status(500).send('Eroare la înregistrare');
    } finally {
        await client.close();
    }
});

app.get('/auth/session', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, username: req.session.user.username });
    } else {
        res.json({ loggedIn: false });
    }
});

app.post('/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Eroare la deconectare' });
        }
        res.clearCookie('connect.sid'); 
        res.status(200).json({ message: 'Deconectat cu succes' });
    });
});


app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('users');

        const user = await collection.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        
        req.session.user = {
            username: user.username
        };

        res.status(200).json({ message: "Login successful" });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        await client.close();
    }
});

app.get('/auth/account-info', async (req, res) => {
    
    if (!req.session.user) {
        return res.status(401).json({ message: "Neautorizat" });
    }

    const client = new MongoClient(url);

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('users');

        
        const user = await collection.findOne({ username: req.session.user.username }, {
            projection: { username: 1, email: 1, createdAt: 1 }
        });

        if (!user) {
            return res.status(404).json({ message: "Utilizatorul nu a fost găsit" });
        }

        
        res.status(200).json({
            username: user.username,
            email: user.email,
            createdAt: user.createdAt
        });
    } catch (err) {
        console.error('Eroare la preluarea informațiilor contului:', err);
        res.status(500).send('Eroare la preluarea informațiilor contului');
    } finally {
        await client.close();
    }
});

app.delete('/auth/delete-account', async (req, res) => {
    const client = new MongoClient(url);

    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Nu ești autentificat' });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('users');

        
        const result = await collection.deleteOne({ username: req.session.user.username });

        if (result.deletedCount === 1) {
            req.session.destroy(); 
            res.clearCookie('connect.sid'); 
            res.status(200).json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'Contul nu a fost găsit' });
        }
    } catch (err) {
        console.error('Eroare la ștergerea contului:', err);
        res.status(500).json({ success: false, message: 'Eroare internă' });
    } finally {
        await client.close();
    }
});


app.listen(port, '0.0.0.0', () => {
    console.log(`Serverul este pornit pe http://localhost:${port}`);
})