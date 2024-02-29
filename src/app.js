// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const path = require('path');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs/promises');

require('./db/conn')
const app = express();
const session = require('express-session'); 
const flash = require('connect-flash');
const port = process.env.PORT || 3000;
const moment = require('moment');

// Connect to MongoDB


// Define a MongoDB schema and model
const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    resetToken: String,
    resetTokenExpiration: Date,
});

const User = mongoose.model('Admin', userSchema);

//Define Products Schema
const productSchema = new mongoose.Schema({
  name: String,
  category:String,
  description: String,
  dimensions:String,
  pdimensions:String,
  weight:String,
  width:String,
  height:String,
  depth:String,
  style:String,
  material:String,
  color:String,
  shape:String,
  stock:String,
  price: String,
  discount:String,
  delivery:String,
  doorway:String,
  time:String,
  mainImage: { data: Buffer, contentType: String },
  otherImages: [{ data: Buffer, contentType: String }],
});

const Product = mongoose.model('Product', productSchema);

//Define Deals Schema

const dealSchema = new mongoose.Schema({
  _id: String,
  name: String,
  category:String,
  description: String,
  dimensions:String,
  pdimensions:String,
  weight:String,
  width:String,
  height:String,
  depth:String,
  style:String,
  material:String,
  color:String,
  shape:String,
  stock:String,
  price: String,
  discount:String,
  delivery:String,
  doorway:String,
  time:String,
  mainImage: { data: Buffer, contentType: String },
  otherImages: [{ data: Buffer, contentType: String }],
});

const Deal = mongoose.model('Deal', dealSchema);


//Define order
const orderSchema = new mongoose.Schema({
  cartId: String,
  name: String,
  email: String,
  contact:String,
  country: String,
  city: String,
  address: String,
  paymentoption: String,
  products: [{
    name: String,
    image: String,
    quantity: String,
  }],
  totalprice: String,
  paymentStatus: { type: String, enum: ['paid', 'pending'], default: 'pending' },
  orderDateTime:String,
 

  deliveryStatus: { type: String, enum: ['pending', 'success'], default: 'pending' }
});
  

const Order = mongoose.model('Order', orderSchema);


//Multer middleware for handling file uploads as buffers
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));





// Create an empty cartData.json file if it doesn't exist









app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
      secret: 'Mern@root2023',
      resave: true,
      saveUninitialized: true,
    })
  );
app.use(flash());

// Serve the registration form


// Validation middleware
const validateRegistration = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirm-password').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
];



app.post('/submit', validateRegistration, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
      // Render the registration form with validation errors
      return res.render('index', { errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          // Email exists
          req.flash('error', 'Email already exists');
          return res.render('index', { errors: [{ msg: 'Email already exists' }] });
      }


       // Hash the password
     const hashedPassword = await bcrypt.hash(password, 10);
      // Create a new user
      const newUser = new User({ name, email, password: hashedPassword });
      await newUser.save();

      // User created successfully
      //req.flash('success', 'User registration was successfull');
      //res.render('forgot', { error: req.flash('error'), success: req.flash('success') });
      res.redirect('/login');
  } catch (error) {
      console.error('Error saving user:', error.message);
     req.flash('error', 'Internal Server Error');
      return res.render('index', { errors: [{ msg: 'Internal Server Error' }] });
  }
});

// ...

// Retrieve users from MongoDB and display on the form
// ...

// Retrieve users from MongoDB and display on the form
app.get('/users', async (req, res) => {
try {
  const users = await User.find();
  res.render('index', { users, errors: null });
} catch (error) {
  console.error('Error fetching users:', error.message);
  req.flash('error', 'Internal Server Error');
  return res.render('index', { errors: [{ msg: 'Internal Server Error' }] });
}
});



//POST Products
app.post('/products', upload.array('images', 12), async (req, res) => {
  const { name, category, description, dimensions,pdimensions, material, stock, color, price,discount,weight,width,height,depth,style,shape,delivery,doorway,time, } = req.body;
  const images = req.files.map(file => ({ data: file.buffer, contentType: file.mimetype }));

  try {
    const newProduct = new Product({
      name,
      category,
      description,
      dimensions,
      pdimensions,
      weight,
      width,
      height,
      depth,
      style,
      material,
      color,
      shape,
      stock,
      price,
      discount,
      delivery,
      doorway,
      time,
      mainImage: { data: images[0].data, contentType: images[0].mimetype },
      otherImages: images.slice(1).map(image => ({ data: image.data, contentType: image.mimetype })),
    });
    await newProduct.save();
    res.redirect('/products'); // Redirect to a page where you display all deals
  } catch (error) {
    console.error('Error saving deal:', error.message);
    res.status(500).send('Internal Server Error');
  }
});
//Update products

app.get('/allproducts', async (req, res) => {
  try {
      // Retrieve products from MongoDB
      const products = await Product.find();

      // Render the form and pass the products to the template
      res.render('products', { products });
  } catch (error) {
      console.error('Error fetching products:', error.message);
      res.status(500).send('Internal Server Error');
  }
});
//app.get('/allproducts', async (req, res) => {
 // res.render('products')
//});




//get Products
app.get('/products', async (req, res) => {
  res.render('AddNewProduct')
});





app.post('/deals', upload.array('images', 12), async (req, res) => {
  const { name, category, description, dimensions,pdimensions,weight,width,height,depth,style,material, color, shape,stock,price,discount,delivery,doorway,time, } = req.body;
  const images = req.files.map(file => ({ data: file.buffer, contentType: file.mimetype }));

  try {
    const newDeal = new Deal({
      name,
      category,
      description,
      dimensions,
      pdimensions,
      weight,
      width,
      height,
      depth,
      style,
      material,
      color,
      shape,
      stock,
      price,
      discount,
      delivery,
      doorway,
      time,
      mainImage: { data: images[0].data, contentType: images[0].mimetype },
      otherImages: images.slice(1).map(image => ({ data: image.data, contentType: image.mimetype })),
    });
    await newDeal.save();
    res.redirect('/deals'); // Redirect to a page where you display all deals
  } catch (error) {
    console.error('Error saving deal:', error.message);
    res.status(500).send('Internal Server Error');
  }
});


//Update deals
app.get('/', async (req, res) => {
  try {
    // Retrieve deals and products from MongoDB
    const deals = await Deal.find();
    const products = await Product.find();

    // Render the dashboard and pass both deals and products to the template
    res.render('dashboard', { deals, products });
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send('Internal Server Error');
  }
});


//get  deal id
app.get('/deals/:name', async (req, res) => {
  try {
    let deals;
    let products;

    // Check if the category is present in the query string
    if (req.query.category) {
      // Fetch similar products based on the provided category from the query string
      deals = await Deal.find({ category: req.query.category });
      products = await Product.find({ category: req.query.category });
    } else {
      // Fetch specific deal details based on the provided name from the route parameter
      const deal = await Deal.findOne({ name: req.params.name });
      const product = await Product.findOne({ name: req.params.name });

      // Check if both deal and product are not found
      if (!deal && !product) {
        return res.status(404).send('Deal or product not found');
      }

      deals = deal ? [deal] : [];
      products = product ? [product] : [];
    }

    // Render a new page with the filtered products or specific deal details
    res.render('prod', { deals, products });

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/products/:name', async (req, res) => {
  try {
    let products;

    // Check if the category is present in the query string
    if (req.query.category) {
      // Fetch similar products based on the provided category from the query string
      products = await Product.find({ category: req.query.category });
    } else {
      // Fetch specific deal details based on the provided name from the route parameter
      const product = await Product.findOne({ name: req.params.name });
      products = [product];
    }

    // Render a new page with the filtered products or specific deal details
    res.render('prodcart', { products });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});






// Dynamic route to handle products based on the category and subcategory
app.get('/products/:category/:subcategory', async (req, res) => {
  const { category, subcategory } = req.params;

  // Fetch products based on the category and subcategory from MongoDB
  const products = await Product.find({ category: subcategory });

  // Render the EJS template with the fetched products
  res.render('productList', { products, category, subcategory });
});


//check out







app.get('/shoppingcart', async (req, res) => {
  try {
    const deals = await Deal.find();
    const products = await Product.find();
  
    // Render an EJS file with the cart data
    res.render('checkout', {deals, products});
  } catch (error) {
   
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/orders', async (req, res) => {
  try {
    const deals = await Deal.find();
    const products = await Product.find();
  
    // Render an EJS file with the cart data
    res.render('checkout', {deals, products});
  } catch (error) {
   
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/orders', upload.single('image'), async (req, res) => {
  try {
    const { name, email,contact,orderDateTime, country, city, address, paymentoption, totalprice } = req.body;

    // Generate a unique cartId (you might want to use a better algorithm in production)
    const generateCartId = () => {
      const timestamp = Date.now().toString();
      const last4Digits = timestamp.slice(-4);
      const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const cartId = last4Digits ;
      return cartId;
    };
    
    const cartId = generateCartId();
    
 

    const cartData = req.body.cartData;

    // Extract products from the cartData
    const products = JSON.parse(cartData).map(product => ({
      name: product.name,
      image: product.image,
      quantity: product.quantity,
    }));

    const newOrder = new Order({
      cartId,
      orderDateTime,
      name,
      email,
      contact,
      country,
      city,
      address,
      paymentoption,
      products,
      totalprice,
    });

    await newOrder.save();
   
    
   
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});












// Serve the registration form
app.get('/', (req, res) => {
res.render('dashboard', { errors: null });
});


app.get('/login', (req, res) => {
  res.render('login', { error: req.flash('error'),success: req.flash('success')  });
  
});
// ...
// Handle login form submission
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });

    if (!user) {
      req.flash('error', 'Invalid email or password');
      //const alertMessage="Invalid email or password";
      //res.render('layout',{alertMessage});
      return res.redirect('/login');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      req.flash('error', 'Invalid email or password');
      //const alertMessage="Invalid email or password";
      //res.render('layout',{alertMessage});
      return res.redirect('/login');
    }
    
// Authentication successful
  req.flash('success', 'Login successful');

  return res.redirect('/dashboard');
// Redirect to the dashboard or another page
   
    
  } catch (error) {
    console.error('Error during login:', error.message);
    req.flash('error', 'Internal Server Error');
    return res.redirect('/login');
  }
});



// Serve the dashboard page
//app.get('/dashboard', (req, res) => {
  //res.render('dashboard');
//});



// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'alexmwend9@gmail.com',
    pass: 'lomg sxfh yhef uclp',
  },
});

// JWT secret key
const jwtSecretKey = '@Mern2024';

// Serve the forgot password form
app.get('/forgot_password', (req, res) => {
  res.render('forgot', { error: req.flash('error'),success: req.flash('success') });
});


//href links
app.get('/forgotpassword', (req, res) => {
  res.render('forgot', { error: req.flash('error'),success: req.flash('success') });
});

app.get('/registerpage', (req, res) => {
  res.render('index', { errors: null });
});
app.get('/loginpage', (req, res) => {
  res.render('login', { error: req.flash('error'),success: req.flash('success') });
});




app.get('/forgot', (req, res) => {
  res.render('forgot', { error: req.flash('error'),success: req.flash('success')  });
});


// Handle password reset initiation
app.post('/forgot_password', async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email });

    if (!user) {

      req.flash('error', 'User not found');
      return res.redirect('/forgot');
  }
  
   

    const resetToken = jwt.sign({ userId: user._id }, jwtSecretKey, { expiresIn: '1h' });

    user.resetToken = resetToken;
    user.resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour from now
    await user.save();

    const resetLink = `http://localhost:3000/reset_password/${resetToken}`;

    const mailOptions = {
      from: 'alexmwend9@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `Click the following link to reset your password: ${resetLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        req.flash('error', 'Error sending mail');
      }

      console.log('Email sent:', info.response);
      //res.json({ message: 'Password reset email sent successfully' });
      req.flash('success','Password reset email sent successfully');
      return res.redirect('/login');
    });
  } catch (error) {
    console.error('Error initiating password reset:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Serve the reset password form
app.get('/reset_password', (req, res) => {
  const { token } = req.params;
  res.render('reset_password', { token, error: req.flash('error'),success: req.flash('success')  });
 //res.render('reset', { error: req.flash('error') });
});
//app.get('/reset', (req, res) => {
 // const { token } = req.params;
  
 // res.render('reset_password', { token, error: req.flash('error') });
 //res.render('reset', { error: req.flash('error') });
//});

// Serve the reset password form
app.get('/reset_password/:token', (req, res) => {
  const { token } = req.params;
  //console.log('Token:', token); 
  res.render('reset_password', { token, error: req.flash('error'),success: req.flash('success')  });
});


// Handle password reset
app.post('/reset_password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decodedToken = jwt.verify(token, jwtSecretKey);

    if (!decodedToken) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findOne({
      _id: decodedToken.userId,
      resetToken: token,
      resetTokenExpiration: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }


    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();
     return res.render('login', { token, error: req.flash('error'),success: req.flash('success')  });
   // res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});





