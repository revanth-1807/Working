const e=require('express')
const d=require('dotenv')
const m=require('mongoose')
const md=require('mongodb').md
const u=require('./Models/Userlogin')
const b=require('bcryptjs')
const jwt=require('jsonwebtoken')
const app= e();
const mw=require('./Middleware')
const rate=require('./Models/Addreview')
const ses=require('express-session');
const l=require('connect-mongodb-session')(ses)


d.config()
const store=new l({
    uri:process.env.M,
    collection:"Mysession"
})
app.use(ses({
    secret: 'This is a secret',
    resave: false,
    saveUninitialized: true,
    store: store
  }))


const cookieParser = require('cookie-parser');
app.use(cookieParser());

const path = require('path');

app.set('view engine', 'ejs');  // Set EJS as the view engine
app.set('views', path.join(__dirname, 'views'));  // Set folder for views

app.use(e.json())
app.use(e.urlencoded({ extended: true }));

m.connect(process.env.M)
.then(()=>{
    console.log('Connected')
})
.catch((err)=>{
    console.log('Not connected')
})

app.get('/register', (req, res) => {
    res.render('register');
  });
  app.get('/login', (req, res) => {
    res.render('login');
  });

  app.get('/Addreview', mw, (req, res) => {
    res.render('addReview'); // You need to create views/addReview.ejs
  });
  
  
app.post('/register',async (req,res)=>{
    const {Name,Email,Password,ConfirmPassword}=req.body;
    const aa=await b.hash(Password,10);
    const bb=await b.hash(ConfirmPassword,10)
    try{
        const c= await u.findOne({Email})
        if(c){
            return res.status(401).send('Already user existed try with another Email');
        }
        if(Password!=ConfirmPassword){
            return res.status(401).send('Password Mismatched');
        }
        const us=new u({
            Name,Email,Password:aa,ConfirmPassword:bb
        })
        await us.save();
        res.redirect('/login');
    }
    catch(err){
        console.log(err)
        return res.status(501).send('Server error',err)
    }
})



app.get('/my-profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('myProfile', { user: req.session.user });
});


app.post('/login', async (req, res) => {
    const { Email, Password } = req.body;
  
    try {
      const user = await u.findOne({ Email }); // Use the correct model `u`
      // if (!user) return res.status(401).send('Invalid Email');
  
      
      if(!user){
        return res.send(`
          <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error Alert</title>
</head>
<body>
    <script>
        // Display the alert message
        alert('No such user');
        window.location.href='/login';
    </script>
</body>
</html>
`)
      }
            const match = await b.compare(Password, user.Password);
            if(!match){
                return res.send(`
          <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error Alert</title>
</head>
<body>
    <script>
        // Display the alert message
        alert('Invalid password');
        window.location.href='/login';
    </script>
</body>
</html>
`)
            }
  
      const token = jwt.sign(
        { user: { id: user._id, Name: user.Name } },
        'revanth',
        { expiresIn: '1h' }
      );
  
      res.cookie('token', token, { httpOnly: true });
     req.session.user = user; // optionally store in session if needed
return res.redirect('/Myprofile');

 // <-- REDIRECT happens here
    } catch (err) {
      console.log(err);
      return res.status(500).send('Server error');
    }
  });
  
  
app.delete('/logout', (req, res) => {
    req.session.destroy((err) => {  // Destroy the session (logout)
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.status(200).json({ message: 'Logged out successfully!' });  // Send success message
    });
});

  app.get('/Allprofiles', mw, async (req, res) => {
    try {
      const profiles = await u.find(); // fetch all user profiles
      res.render('allProfiles', { profiles });
    } catch (err) {
      console.log(err);
      res.status(500).send('Server error');
    }
  });
  

app.get('/Myprofile', mw, async (req, res) => {
    try {
      const user = await u.findById(req.user.id);
      res.render('myProfile', { profile: user }); // 🔥 THIS NAME MATTERS!
    } catch (err) {
      console.log(err);
      res.status(500).send('Server error');
    }
  });
  

app.delete('/delete/:Email', async (req, res) => {
  try {
    const deletedUser = await u.findOneAndDelete({ Email: req.params.Email });
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Deleted successfully!' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
  

app.get('/Myreview', mw, async (req, res) => {
  try {
    // Find the logged-in user's name
    const currentUser = await u.findById(req.user.id);
    if (!currentUser) {
      return res.send(`
        <script>
          alert('User not found.');
          window.location.href = '/login';
        </script>
      `);
    }

    // Use the user's name to find reviews
    const reviews = await rate.find({ Worker: currentUser.Name });
    res.render('myReview', { reviews });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


  app.post('/Addreview', mw, async (req, res) => {
  try {
    const { Email, rating } = req.body;

    if (!Email || !rating || isNaN(rating) || rating < 1 || rating > 5) {
      return res.send(`
        <script>
          alert('Invalid input: Provide a valid email and a rating between 1 and 5.');
          window.location.href = '/Addreview';
        </script>
      `);
    }

    const workerUser = await u.findOne({ Email: Email });
    if (!workerUser) {
      return res.send(`
        <script>
          alert('Worker with that email not found.');
          window.location.href = '/Addreview';
        </script>
      `);
    }

    const reviewer = await u.findById(req.user.id);
    if (!reviewer) {
      return res.send(`
        <script>
          alert('You are not logged in.');
          window.location.href = '/login';
        </script>
      `);
    }
// console.log('workerUser:', workerUser);
if(reviewer.Email === workerUser.Email){
  return res.send(`
        <script>
          alert('You cannot give review to yourself');
          window.location.href = '/Addreview';
        </script>
      `);
}

    const newReview = new rate({
      Provider: reviewer.Name,     // 👈 Save name as string
      Worker: workerUser.Name,     // 👈 Save name as string
      rating: Number(rating)
    });

    await newReview.save();

    return res.send(`
      <script>
        alert('Review submitted successfully!');
        window.location.href = '/Myprofile';
      </script>
    `);
  } catch (err) {
    console.error('Error adding review:', err.message);
    return res.status(500).send(`
      <script>
        alert('Server error while adding review.');
        window.location.href = '/Addreview';
      </script>
    `);
  }
});


app.listen(5000,()=>{
    console.log('server running at 5000')
})
