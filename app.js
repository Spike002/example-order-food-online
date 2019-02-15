var express = require('express');
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");
var Review = require("./models/review");


var app = express();

mongoose.connect('mongodb://yung:yung123@ds137255.mlab.com:37255/yungrest', {useNewUrlParser: true});
//mongoose.connect('mongodb://localhost:27017/YungRiver', {useNewUrlParser: true});

app.use(express.static(__dirname + "/public"));

//for delete and update
app.use(methodOverride("_method"));

app.set("view engine", "ejs");

// include this when using local passport
app.use(require("express-session")({
    secret: "I am Dumb",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use(function(req,res, next){
    res.locals.currentUser = req.user;
    next();
})

app.use(bodyParser.urlencoded({extended:true}));
// var menus =[
//             {
//                 name: "Bean and marjoram risotto", 
//                 note: "Vegan scones served with beetroot jam and fresh coconut cream",
//                 price: "13.25"
//             },
//             {
//                 name: "Bean and plantain stew",
//                 note: "Crunchy bread made with fresh basil and rhubarb",
//                 price: "13.95"
//             },
//             {
//                 name: "Bean and beetroot cake",
//                 note: "A puff pasty case filled with fresh beetroot and garlic",
//                 price: "9.95"
//             },
//             {
//                 name: "Bean and apple burgers",
//                 note: "A mouth-watering bean salad served with basil dressing",
//                 price: "12.15"
//             },
//             {
//                 name: "Truffle tart with bean sauce",
//                 note: "A rich pastry case filled with beetroot and served with bean sauce",
//                 price: "11.65" 
//             },
//             {
//                 name: "Bean and mushroom madras",
//                 note: "Rich cake made with bean and fresh beetroot",
//                 price: "12.50"
//             },
//             {
//                 name: "Bean and aubergine korma",
//                 note: "Layers of egg-free pasta interspersed with bean and fresh spinach",
//                 price: "10.56"
//             },
//             {
//                 name: "Bean and peanut vindaloo",
//                 note: "Crunchy stir fry featuring fresh beetroot and basil",
//                 price: "12.64"
                
//             },
//             {
//                 name: "Bean and potato curry", 
//                 note: "Creamy risotto rice with bean and fresh beetroot", 
//                 price: "11.35"
//             },
//             {
//                 name: "Broccoli and cider vinegar salad",
//                 note: "Fresh avocado and broccoli served on a bed of lettuce",
//                 price: "10.25"
//             },
//             {
//                 name: "Broccoli and avocado fusilli", 
//                 note: "Fresh basil and beetroot combined into smooth soup",
//                 price: "9.25"
//             },
//             {
//                 name: "Avocado and broccoli penne",
//                 note: "Fresh egg pasta in a sauce made from fresh broccoli and avocado",
//                 price: "8.50"
//             },
//             {
//                 name: "Broccoli and avocado spaghetti",
//                 note: "Fresh egg tubular pasta in a sauce made from fresh broccoli and avocado",
//                 price: "9.25"     
//             },
//             {
//                 name: "Broccoli and avocado pasta",
//                 note: "Spagetti topped with a blend of fresh broccoli and avocado",
//                 price: "9.25"
//             },
//             {
//                 name: "Broccoli and corn crepes",
//                 note: "Fresh egg pasta in a sauce made from fresh broccoli and avocado",
//                 price: "10.50"
//             },
//             {
//                 name: "Avocado and cardamom pudding",
//                 note: "Fluffy crepes filled with fresh broccoli and socca",
//                 price: "10.50"
//             },
//             {
//                 name: "Avocado salad with garlic dressing",
//                 note: "A rich suet pudding made with fresh avocado and organic pears",
//                 price: "12.50"
//             },
//             {
//                 name: "Avocado sandwich with onion relish",
//                 note: "A mouth-watering cider vinegar salad served with garlic dressing",
//                 price: "12.50"
//             },
//             {
//                 name: "Avocado and chilli toastie",
//                 note: "Avocado and onion relish served between slices of fresh bread",
//                 price: "12.50"
//             }
//         ];
        
var menuSchema = new mongoose.Schema({
    name: String,
    note: String,
    price: String
});     

var Menu = mongoose.model('Menu', menuSchema);

// create menusseed to DB
// function seedDB(){
//     menus.forEach(function(each_menu){
//       Menu.create(each_menu, function(error, successmenuadd){
//           if (error){
//               console.log(error);
//           }else{
//               console.log('add menuadd is successfully');
//           }
//       }) 
//     })
// }

//call seedDB function
// seedDB();

app.get('/', function(req,res){
    
    res.redirect('/home');
})

app.get('/home', function (req, res) {
    
    Menu.find({}, function(error, found_menus){
        if(error){
            console.log("find is error");
        }else{
            res.render('home', {menuinhome: found_menus, currentUser:req.user });
        }
    });
    
    // Review.find({}, function(error, found_review){
    //     if(error){
    //         console.log("find is error");
    //     }else{
            
    //         res.render('home', {ReviewFound: found_review});
    //     }
    // });
});

app.get('/home/:id', isLoggedIn,  function(req, res) {
    Menu.findById(req.params.id, function(error, foundmenus){
        if(error){
            console.log('error');
        }else{
            
            var subtotal = parseFloat(foundmenus.price);
            var delivery = 2.50;
            var tax = (subtotal * 6.25) / 100;
            var estimatedTax = Number(Math.round(tax+'e2')+'e-2');
            var OrderTotal = subtotal + delivery + estimatedTax;
            console.log(OrderTotal);
            
            var Ordersummary = {
                subtotal: subtotal, 
                estTax: estimatedTax, 
                orderTo: OrderTotal
            };
            
            res.render('order', {Foundmenu:foundmenus, OrderSummary: Ordersummary});
        }
    })
});



app.get('/pickup/:id', isLoggedIn, function(req,res){
    Menu.findById(req.params.id, function(error, foundmenus){
        if (error){
            console.log(error);
        }else{
            res.render('orderpickup',{Foundmenu:foundmenus})
        }
    });
});

app.get('/delivery/:id',isLoggedIn, function(req,res){
    Menu.findById(req.params.id, function(error, foundmenus){
        if (error){
            console.log(error);
        }else{
            res.render('orderdelivery',{Foundmenu:foundmenus})
        }
    });
    
});


app.get('/home/delivery/:id', isLoggedIn,  function(req,res){
    Menu.findById(req.params.id, function(error, foundmenus){
        if (error){
            console.log(error);
        }else{
            res.send("I will send it");
        }
    });
});

app.post('/pickup/checkup/:id',isLoggedIn, function(req, res) {
    // console.log(req.body.selectedoption);
    // console.log(req.params.id);
    Menu.findById(req.params.id, function(error, foundmenus){
        if (error){
            console.log(error);
        }else{
            var Qty = parseFloat(req.body.selectedoption);
            var Price = parseFloat(foundmenus.price);
            var subtotal = Qty * Price; 
            var tax = (subtotal * 6.25) / 100;
            var estimatedTax = Number(Math.round(tax+'e2')+'e-2');
            var OrderTotal = subtotal + estimatedTax;
            
            var Ordersummary = {
                Qty: Qty,
                Price: Price,
                Subtotal: subtotal,
                EstimatedTax: estimatedTax,
                OrderTotal: OrderTotal
            };
            res.render('checkoutpickup',{Order: Ordersummary})
        }
    });
    
    
});



app.post('/delivery/checkup/:id',isLoggedIn, function(req, res){
    var deliveryAddress = {
        address: req.body.address,
        city: req.body.city,
        state: req.body.selectState,
        zipcode: req.body.zipcode
    }
    var Qty = parseFloat(req.body.selectedoption);
    var deliveryFee = 2.5;
    
    Menu.findById(req.params.id, function(error, foundmenus){
        if (error){
            console.log(error);
        }else{
            var Price = parseFloat(foundmenus.price);
            var subtotal = (Qty * Price) + deliveryFee; 
            var tax = (subtotal * 6.25) / 100;
            var estimatedTax = Number(Math.round(tax+'e2')+'e-2');
            var OrderTotal = subtotal + estimatedTax;
            
            var Ordersummary = {
                Qty: Qty,
                Price: Price,
                DeliverFee: "2.50", 
                Subtotal: subtotal,
                EstimatedTax: estimatedTax,
                OrderTotal: OrderTotal
            };
            res.render('checkoutdelivery',{Order: Ordersummary, Address:deliveryAddress, Menu:foundmenus })
        }
    });
});


app.get('/register', function(req, res) {
    res.render('register');
});


app.post('/register', function(req, res) {
    console.log(req.body.username+ " " + req.body.password);
    
    //method register ( create ) and has to use with local passport
    User.register(new User({username: req.body.username}), req.body.password, function(error,user){
        if(error){
                console.log(error);
                return res.render('register');
            }
           
            //if no error, once a user login it will rediect to home
            passport.authenticate("local")(req, res, function(){
                res.redirect('/home');
            })
    });
    
    
    
});

//login
app.get("/login", function(req, res) {
    res.render('login');
});

app.post('/login',passport.authenticate("local",{
    successRedirect: "/home",
    failureRedirect: "/login"
}),function(req, res){
    
});

//addreview
app.get('/addreview', isLoggedIn, function(req, res) {
    res.render('review');
});

    
    


app.post('/addreview', isLoggedIn, function(req, res) {
    
    var newReview = new Review({
        text: req.body.review,
        author: req.user.username
    });
    
   newReview.save(function(error, reviewed){
        if(error){
            console.log("error");
        }else{
            console.log("reviewed is successfully added");
           
            res.redirect('about');
        }
    })
    
    
});

app.get('/about', function(req, res) {
    
     Review.find({}, function(error, reviews){
        if(error){
            console.log("find is error");
        }else{
            res.render('about', {FoundReviews: reviews});
        }
    });
});


// app.get('/about/:id/edit', function(req, res) {
//     Review.findById(req.params.id, function(error, foundReview){
//         if(error){
//             console.log("Found error");
//         }else{
//             res.render("reviews/edit")
//         }
//     })
// })

app.get("/about/:id", isLoggedIn, function(req, res) {
    //findByIdAndRemove
    Review.findOneAndDelete(req.params.id, function(error){
        if(error){
           console.log('delete found error')
        }else{
            res.redirect('/about');
        }
        
    });
    
});

//Log out
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});



function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/home");
    
}



app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Yung River Chinese Has started!");
});