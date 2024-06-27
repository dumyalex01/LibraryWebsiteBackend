const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password:'',
    database: 'test'
});

app.get('/', (req, res) => {
    return res.json("From Backend Side");
});

app.post('/utilizatori', (req, res) => {
    console.log("SALUT");
    const { username, password } = req.body;
    const sql = "SELECT ID_User,Tip FROM utilizatori WHERE Username = ? AND Password = ?";
    db.query(sql, [username, password], (err, data) => {
        if (err) {
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }
        if (data.length > 0) {
            const userID = data[0].ID_User;
            const userTip = data[0].Tip;
            if (userTip === 1) {
                return res.status(200).json({ message: 1, userID });
            } else if (userTip === 2) {
                return res.status(200).json({ message: 2, userID });
            } else {
                return res.status(401).json({ error: "Tip de utilizator necunoscut." });
            }
        } else {
            return res.status(401).json({ error: "Numele de utilizator sau parola incorecte." });
        }
    });
});

app.get('/utilizatori', (req, res) => {
    console.log("SALUT");
    const sql = "SELECT * FROM detaliiutilizatori du inner join utilizatori u on u.ID_User=du.ID_User";
    db.query(sql, (err, data) => {
        if (err) {
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }
        return res.status(200).json(data);
    });
});

app.get('/carti', (req, res) => {
    const sql = "SELECT * FROM carti";
    db.query(sql, (err, data) => {
        if (err) {
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }
        return res.status(200).json(data);
    });
});

const formidable = require('formidable');

app.post('/carti', (req, res) => {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Eroare la parsarea datelor formularului:', err);
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }

        const { bookName, bookAuthor, bookType, bookStock, bookUrl } = fields;

        const sql = "INSERT INTO carti (Nume, Autor, Tip, Stoc, URL) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [bookName, bookAuthor, bookType, bookStock, bookUrl], (err, result) => {
            if (err) {
                console.error('Eroare la inserarea datelor în baza de date:', err);
                return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
            }
            console.log('Datele au fost inserate cu succes în baza de date:', result);
            return res.status(200).json({ message: "Datele au fost inserate cu succes în baza de date." });
        });
    });
});

app.post('/detaliiutilizatori', (req, res) => {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Eroare la parsarea datelor formularului:', err);
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }

        const { userID } = fields; 

        const sql = "SELECT * FROM detaliiutilizatori WHERE ID_User = ?";
        db.query(sql, [userID], (err, data) => {
            if (err) {
                return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
            }
            if (data.length > 0) {
                return res.status(200).json(data[0]);
            } else {
                return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });
            }
        });
    });
});

app.post('/updateStock', (req, res) => {
    bookName=req.body.bookID;
    newStock=req.body.newStock;
    console.log(bookName);
    console.log(newStock);
    if (!bookName || !newStock) {
        return res.status(400).json({ error: "Numele cărții și stocul nou sunt necesare pentru actualizare." });
    }

    const sql = `UPDATE carti SET Stoc = ? WHERE Nume = ?`;

    db.query(sql, [newStock, bookName], (err, result) => {
        if (err) {
            console.error('Eroare la actualizarea stocului:', err);
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }
        console.log("Stocul cărții a fost actualizat cu succes!");
        return res.status(200).json({ message: "Stocul cărții a fost actualizat cu succes!" });
    });
});
app.post('/updateDetaliiUtilizator1', (req, res) => {
    const { userID, optiune, nouaValoare } = req.body;
    console.log(userID);

    const sql = `UPDATE utilizatori SET ${optiune} = ? WHERE ID_User = ?`;
    db.query(sql, [nouaValoare, userID], (err, result) => {
        if (err) {
            console.error('Eroare la actualizarea datelor în baza de date:', err);
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }
        console.log('Datele au fost actualizate cu succes în baza de date:', result);
        return res.status(200).json({ message: "Datele au fost actualizate cu succes în baza de date." });
    });
});

app.post('/updateDetaliiUtilizator', (req, res) => {
    const form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Eroare la parsarea datelor formularului:', err);
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }

        const { userID, optiune, nouaValoare } = fields;

        const sql = `UPDATE detaliiutilizatori SET ${optiune} = ? WHERE ID_User = ?`;
        db.query(sql, [nouaValoare, userID], (err, result) => {
            if (err) {
                console.error('Eroare la actualizarea datelor în baza de date:', err);
                return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
            }
            console.log('Datele au fost actualizate cu succes în baza de date:', result);
            return res.status(200).json({ message: "Datele au fost actualizate cu succes în baza de date." });
        });
    });
});
app.get('/rezervari', (req, res) => {
    const sql = "SELECT r.ID,du.Nume, du.Prenume,r.Luna,r.Zi, r.Ora, r.Minut, c.Nume AS NumeCarte, c.Autor AS AutorCarte FROM detaliiutilizatori du INNER JOIN rezervari r ON r.ID_User = du.ID_User INNER JOIN carti c ON c.ID = r.ID_carte";
    db.query(sql, (err, data) => {
        if (err) {
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }
        return res.status(200).json(data);
    });
});
app.get('/carti', (req, res) => {
    const sql = "SELECT ID, Nume FROM carti";
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Eroare la interogarea bazei de date pentru lista de cărți:', err);
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }
        return res.status(200).json(data);
    });
});
app.get('/utilizatori1', (req, res) => {
    const sql = "SELECT ID_User, Username FROM utilizatori WHERE Tip=2";
    db.query(sql, (err, data) => {
        if (err) {
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }
        return res.status(200).json(data);
    });
});
app.post('/deleteUsers', (req, res) => {
    const { usersToDelete } = req.body;

    if (!usersToDelete || usersToDelete.length === 0) {
        return res.status(400).json({ error: "Niciun utilizator selectat pentru ștergere." });
    }

    const sqlDeleteUtilizatori = "DELETE FROM utilizatori WHERE ID_User IN (?)";
    const sqlDeleteDetaliiUtilizatori = "DELETE FROM detaliiutilizatori WHERE ID_User IN (?)";

    db.query(sqlDeleteDetaliiUtilizatori, [usersToDelete], (err1, result1) => {
        if (err1) {
            console.error('Eroare la ștergerea utilizatorilor din tabela "detaliiutilizatori":', err1);
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }

        db.query(sqlDeleteUtilizatori, [usersToDelete], (err2, result2) => {
            if (err2) {
                console.error('Eroare la ștergerea utilizatorilor din tabela "utilizatori":', err2);
                return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
            }

            console.log('Utilizatorii au fost șterși cu succes din ambele tabele.');
            return res.status(200).json({ message: "Utilizatorii au fost șterși cu succes din ambele tabele." });
        });
    });
});

app.get('/cartiTemplate', (req, res) => {
    const sql = "SELECT * FROM carti";
    db.query(sql, (err, data) => {
        if (err) {
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }
        return res.status(200).json(data);
    });
});

app.get('/cartiTemplateForGuest', (req, res) => {

    const sql = `SELECT * FROM carti ORDER BY ID LIMIT 3`;
    db.query(sql, (err, data) => {
        if (err) {
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }
        console.log(data);
        return res.status(200).json(data);
    });
});

app.post('/detaliiUtilizator', (req, res) => {
    console.log("SALUT");
    const { userID, tip } = req.body;
    console.log(userID); 
    const sql = `SELECT ${tip} FROM detaliiutilizatori WHERE ID_User=?`;
    db.query(sql, [userID], (err, data) => { 
        if (err) {
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }
        return res.status(200).json(data);
    });
});

app.get('/clientFavorit', (req, res) => {
    const query = `
    SELECT 
        du.Nume,
        du.Prenume,
        COUNT(r.ID_User) AS NumarRezervari
    FROM 
        detaliiutilizatori du
    JOIN 
        rezervari r ON du.ID_User = r.ID_User
    GROUP BY 
        du.ID_User
    ORDER BY 
        COUNT(r.ID_User) DESC
    LIMIT 1
  `;
    db.query(query, (error, results) => {
      if (error) {
        console.error('Eroare la interogare:', error);
        res.status(500).json({ error: 'A apărut o eroare' });
        return;
      }
      res.json(results[0]);
    });
  });
app.get('/ceaMaiRezervataCarte', (req, res) => {
    const query = `
      SELECT Carti.*, COUNT(Rezervari.ID) AS NumarRezervari
      FROM Carti
      LEFT JOIN Rezervari ON Carti.ID = Rezervari.ID_Carte
      GROUP BY Carti.ID
      ORDER BY NumarRezervari DESC
      LIMIT 1
    `;
  
    db.query(query, (error, results) => {
      if (error) {
        console.error('A apărut o eroare:', error);
        res.status(500).json({ error: 'A apărut o eroare la server.' });
      } else {
        if (results.length > 0) {
          res.json(results[0]);
        } else {
          res.status(404).json({ error: 'Nu s-a găsit nicio carte rezervată.' });
        }
      }
    });
  });
  app.post('/autentificare', (req, res) => {
    const { firstName, lastName, locality, idSeries, phone, email, username, password ,autentificare_admin} = req.body;
    console.log(autentificare_admin);

    const sqlCheckExistence = "SELECT * FROM utilizatori WHERE Username = ?";
    db.query(sqlCheckExistence, [username], (err, data) => {
        if (err) {
            console.error('Eroare la verificarea existenței utilizatorului:', err);
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }
        if (data.length > 0) {
            return res.status(400).json({ error: "Numele de utilizator este deja folosit." });
        }
        var tipUser;
        if(autentificare_admin==1)
            tipUser=1;
        else tipUser=2;
        const sqlInsertUser = "INSERT INTO utilizatori (Username, Password, Tip) VALUES (?, ?, ?)";
        db.query(sqlInsertUser, [username, password,tipUser], (err, result) => {
            if (err) {
                console.error('Eroare la inserarea datelor în tabela utilizatori:', err);
                return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
            }
            console.log('Datele au fost inserate cu succes în tabela utilizatori.');

            const userID = result.insertId;

            const sqlInsertDetails = "INSERT INTO detaliiutilizatori (ID_User, Nume, Prenume, Localitate, SerieBuletin, Telefon, Email) VALUES (?, ?, ?, ?, ?, ?, ?)";
            db.query(sqlInsertDetails, [userID, firstName, lastName, locality, idSeries, phone, email], (err, result) => {
                if (err) {
                    console.error('Eroare la inserarea datelor în tabela detaliiutilizatori:', err);
                    return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
                }
                console.log('Detaliile utilizatorului au fost inserate cu succes în tabela detaliiutilizatori.');
                return res.status(200).json({ message: "Autentificare reușită.", userID });
            });
        });
    });
});
app.post('/rezervare', (req, res) => {
    console.log("SALUT");
    const { bookName, userId } = req.body;
    

    const sqlReduceStock = "UPDATE carti SET Stoc = Stoc - 1 WHERE Nume = ? AND Stoc > 0";
    db.query(sqlReduceStock, [bookName], (err, result) => {
        if (err) {
            console.error('Eroare la actualizarea stocului cărții:', err);
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: "Stocul pentru această carte este epuizat sau cartea nu a fost găsită." });
        }

        const currentDate = new Date();
        const ora = currentDate.getHours();
        const minut = currentDate.getMinutes();
        const luna = currentDate.getMonth() + 1;
        const day=currentDate.getDate();
       

        const sqlInsertReservation = "INSERT INTO rezervari (ID_User, ID_Carte, Ora, Minut, Luna,Zi) SELECT ?, ID, ?, ?, ?,? FROM carti WHERE Nume = ?";
        db.query(sqlInsertReservation, [userId, ora, minut, luna, day, bookName], (err, result) => {
            if (err) {
                console.error('Eroare la crearea rezervării:', err);
                return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
            }
            if (result.affectedRows === 0) {
                console.error('Cartea nu a fost găsită pentru a crea rezervarea.');
                return res.status(404).json({ error: "Cartea nu a fost găsită." });
            }
            console.log('Rezervare creată cu succes.');
            return res.status(200).json({ message: "Rezervare creată cu succes." });
        });
    });
});

app.post('/rezervariExpirare', (req, res) => {
    const { userID } = req.body;

    if (!userID) {
        return res.status(400).json({ error: "ID-ul utilizatorului nu este disponibil." });
    }
    

    const currentDate = new Date();
    luna=currentDate.getMonth()+1;
    zi=currentDate.getDate()-1;
    ora=currentDate.getHours()
    minut=currentDate.getMinutes();
    console.log(luna,zi,ora,minut);
    

    const sql = `
        SELECT c.ID, c.Nume, c.Autor
        FROM carti c
        JOIN rezervari r ON c.ID = r.ID_Carte
        WHERE r.ID_User = ? AND r.Luna= ? AND r.Zi= ? AND 
        (
            (r.Ora > ? AND r.Ora < ?) OR
            (r.Ora = ? AND r.minut < ?) OR
            (r.Ora = ? AND r.minut > ?)
        )

    `;
    db.query(sql, [userID,luna,zi,ora,ora+2,ora+2,minut,ora,minut], (err, data) => {
        if (err) {
            console.error('Eroare la obținerea listei de cărți cu expirare:', err);
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        
        }
    
        return res.status(200).json(data);
    });
});

app.post('/rezervariActive', (req, res) => {
    const id = req.body.id;
    console.log(id);
    const currentDate = new Date();
    const oneDayAgo = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    const luna = oneDayAgo.getMonth() + 1; 
    const zi = oneDayAgo.getDate();
    const ora = oneDayAgo.getHours();
    const minut = oneDayAgo.getMinutes();

    const sql = `
        SELECT rezervari.ID, carti.Nume AS NumeCarte, carti.Autor AS AutorCarte, rezervari.Luna, rezervari.Zi, rezervari.Ora, rezervari.Minut 
        FROM rezervari 
        INNER JOIN carti ON rezervari.ID_Carte = carti.ID 
        WHERE rezervari.ID_User = ? 
        AND (
            rezervari.Luna > ? OR 
            (rezervari.Luna = ? AND rezervari.Zi > ?) OR 
            (rezervari.Luna = ? AND rezervari.Zi = ? AND rezervari.Ora > ?) OR 
            (rezervari.Luna = ? AND rezervari.Zi = ? AND rezervari.Ora = ? AND rezervari.Minut > ?)
        )
    `;
    db.query(sql, [id, luna, luna,zi,luna,zi,ora,luna,zi,ora,minut], (err, result) => {
        if (err) {
            console.error('Eroare la obținerea rezervărilor active:', err);
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }
        console.log('Rezervările active au fost obținute cu succes.');
        return res.status(200).json(result);
    });
});

app.post('/rezervariInactive', (req, res) => {
    const id = req.body.id; 

    const currentDate = new Date();
    const twentyFourHoursAgo = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

    const currentMonth = twentyFourHoursAgo.getMonth() + 1;
    const currentDay = twentyFourHoursAgo.getDate();
    const currentHour = twentyFourHoursAgo.getHours();
    const currentMinute = twentyFourHoursAgo.getMinutes();

    const sql = `
        SELECT rezervari.ID, carti.Nume AS NumeCarte, carti.Autor AS AutorCarte, rezervari.Luna, rezervari.Zi, rezervari.Ora, rezervari.Minut 
        FROM rezervari 
        INNER JOIN carti ON rezervari.ID_Carte = carti.ID 
        WHERE rezervari.ID_User = ? 
        AND (
            rezervari.Luna < ? OR 
            (rezervari.Luna = ? AND rezervari.Zi < ?) OR 
            (rezervari.Luna = ? AND rezervari.Zi = ? AND rezervari.Ora < ?) OR 
            (rezervari.Luna = ? AND rezervari.Zi = ? AND rezervari.Ora = ? AND rezervari.Minut < ?)
        )
    `;
    db.query(sql, [id, currentMonth, currentMonth, currentDay, currentMonth, currentDay, currentHour, currentMonth, currentDay, currentHour, currentMinute], (err, result) => {
        if (err) {
            console.error('Eroare la obținerea rezervărilor inactive:', err);
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }
        console.log(result)
        console.log("Rezervări inactive trimise!");
        return res.status(200).json(result);
    });
});

app.get('/clientCuCeleMaiMulteRezervari', (req, res) => {
    const sql = `
        SELECT 
            u.Nume AS NumeClient, 
            u.Prenume AS PrenumeClient, 
            COUNT(r.ID) AS NumarRezervari
        FROM 
            rezervari r
        INNER JOIN 
            detaliiutilizatori u ON r.ID_User = u.ID
        GROUP BY 
            r.ID_User
        ORDER BY 
            NumarRezervari DESC
        LIMIT 1
    `;
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Eroare la obținerea clientului cu cele mai multe rezervări:', err);
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }
        if (result.length > 0) {
            console.log("Clientul cu cele mai multe rezervări:", result[0]);
            return res.status(200).json(result[0]);
        } else {
            console.log("Nu s-au găsit rezervări.");
            return res.status(404).json({ error: "Nu s-au găsit rezervări." });
        }
    });
});

app.post('/notificariUtilizator', (req, res) => {
    const { userID } = req.body;

    if (!userID) {
        return res.status(400).json({ error: "ID-ul utilizatorului nu este disponibil." });
    }

    const sql = "SELECT Mesaj FROM notificari WHERE ID_User = ?";
    db.query(sql, [userID], (err, data) => {
        if (err) {
            console.error('Eroare la obținerea listei de notificări pentru utilizator:', err);
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }
        return res.status(200).json(data);
    });
});

app.post('/notificariAdmin', (req, res) => {
    const { username, message } = req.body;
    console.log(username)
    const sqlGetUserId = "SELECT ID_User FROM utilizatori WHERE Username = ?";
    db.query(sqlGetUserId, [username], (err, data) => {
        if (err) {
            console.error('Eroare la căutarea utilizatorului:', err);
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });
        }

        const userId = data[0].ID_User;

        const sqlInsertNotification = "INSERT INTO notificari (ID_User, Mesaj) VALUES (?, ?)";
        db.query(sqlInsertNotification, [userId, message], (err, result) => {
            if (err) {
                console.error('Eroare la inserarea notificării:', err);
                return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
            }
            console.log('Notificare inserată cu succes în baza de date.');
            return res.status(200).json({ message: "Notificare trimisă cu succes!" });
        });
    });
});

app.post('/updateUser', (req, res) => {
    const { userID, actionType, value } = req.body;
    console.log("SALUT");
    console.log(userID,actionType,value);

    const sqlCheckExistence = "SELECT * FROM detaliiutilizatori WHERE ID_User = ?";
    db.query(sqlCheckExistence, [userID], (err, data) => {
        if (err) {
            console.error('Eroare la verificarea existenței utilizatorului:', err);
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }

        if (data.length === 0) {
            return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });
        }

        const updateField = `${actionType} = ?`;
        const sqlUpdateDetails = `UPDATE detaliiutilizatori SET ${updateField} WHERE ID_User = ?`;
        db.query(sqlUpdateDetails, [value, userID], (err, result) => {
            if (err) {
                console.error('Eroare la actualizarea detaliilor utilizatorului:', err);
                return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
            }
            console.log('Detaliile utilizatorului au fost actualizate cu succes.');
            return res.status(200).json({ message: "Detaliile utilizatorului au fost actualizate cu succes." });
        });
    });
});

app.post('/cautareCarti', (req, res) => {
    const { tip, autor, stoc,nume } = req.body;
    console.log(nume);

    let sql = 'SELECT * FROM carti WHERE ';
    let params = [];
    
    if (nume) {
        sql += 'Nume LIKE ? AND ';
        params.push(`%${nume}%`);
    }

    if (tip!="Oricare") {
        sql += 'Tip = ? AND ';
        params.push(tip);
    }

    if (autor) {
        sql += 'Autor = ? AND ';
        params.push(autor);
    }

    if (stoc) {
        sql += 'Stoc >= ? AND ';
        params.push(stoc);
    }


    sql = sql.slice(0, -5);

    db.query(sql, params, (err, data) => {
        if (err) {
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }
        return res.status(200).json(data);
    });
});

app.get('/rezervariNeonorate', (req, res) => {
    const currentDate = new Date();
    const twentyFourHoursAgo = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

    const currentMonth = twentyFourHoursAgo.getMonth() + 1;
    const currentDay = twentyFourHoursAgo.getDate();
    const currentHour = twentyFourHoursAgo.getHours();
    const currentMinute = twentyFourHoursAgo.getMinutes();
    const sql = `SELECT * 
    FROM rezervari 
    WHERE rezervari.Finalizata is NULL 
    AND (
        rezervari.Luna < ? OR 
        (rezervari.Luna = ? AND rezervari.Zi < ?) OR 
        (rezervari.Luna = ? AND rezervari.Zi = ? AND rezervari.Ora < ?) OR 
        (rezervari.Luna = ? AND rezervari.Zi = ? AND rezervari.Ora = ? AND rezervari.Minut < ?)
    )`;
    db.query(sql,[currentMonth,currentMonth,currentDay,currentMonth,currentDay,currentHour,currentMonth,currentDay,currentHour,currentMinute],(err, data) => {
        if (err) {
            console.error('Eroare la obținerea rezervărilor neonorate:', err);
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }
        return res.status(200).json(data);
    });
});

app.post('/finalizareRezervare', (req, res) => {
    const { idRezervare, idCarte, idUtilizator } = req.body;
    console.log(idRezervare);

    const sqlGetBookName = "SELECT Nume FROM carti WHERE ID = ?";
    db.query(sqlGetBookName, [idCarte], (err0, result0) => {
        if (err0) {
            console.error('Eroare la obținerea numelui cărții:', err0);
            return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
        }

        const bookName = result0[0].Nume;

        const sqlUpdateStock = "UPDATE carti SET Stoc = Stoc + 1 WHERE ID = ?";
        db.query(sqlUpdateStock, [idCarte], (err1, result1) => {
            if (err1) {
                console.error('Eroare la actualizarea stocului cărții:', err1);
                return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
            }

            const mesaj = `Cartea "${bookName}" a fost predată cu succes. Vă mulțumim că ați folosit serviciile noastre!`;
            const sqlInsertNotification = "INSERT INTO notificari (ID_User, Mesaj) VALUES (?, ?)";
            db.query(sqlInsertNotification, [idUtilizator, mesaj], (err2, result2) => {
                if (err2) {
                    console.error('Eroare la inserarea notificării:', err2);
                    return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
                }

                const sqlUpdateReservation = "UPDATE rezervari SET Finalizata = 1 WHERE ID=?";
                db.query(sqlUpdateReservation, [idRezervare], (err3, result3) => {
                    if (err3) {
                        console.error('Eroare la actualizarea rezervării:', err3);
                        return res.status(500).json({ error: "A apărut o eroare în procesarea cererii." });
                    }
                    console.log('Rezervarea a fost finalizată cu succes.');
                    return res.status(200).json({ message: "Rezervarea a fost finalizată cu succes." });
                });
            });
        });
    });
});
app.listen(8081, () => {
    console.log("listening");
});

