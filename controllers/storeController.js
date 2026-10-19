const Home = require('../models/home');
const User = require('../models/user');
const home = require('../models/home');


exports.getIndex = (req, res, next) => {
    Home.find()
        .then((registeredHomes) => {
            // console.log("registeredHomes:", registeredHomes);   // check this in the terminal
            console.log("Session value IsLoggedIn : ", req.session.isLoggedIn)
            res.render('store/index', { registeredHomes: registeredHomes, pageTitle: 'airbnb Home', currentPage: 'index', isLoggedIn: req.isLoggedIn, user: req.session.user });
        })
        .catch(err => console.log(err));
}

exports.getHomes = (req, res, next) => {

    Home.find()
        .then((registeredHomes) => {
            res.render('store/home-list', { registeredHomes: registeredHomes, pageTitle: 'Home-List', isLoggedIn: req.isLoggedIn, currentPage: 'Home-List', user: req.session.user });
        })
        .catch(err => console.log(err));
}

exports.getBookings = (req, res, next) => {

    res.render('store/bookings', {
        pageTitle: 'My Bookings',
        currentPage: 'bookings',
        isLoggedIn: req.isLoggedIn,
        user: req.session.user
    })
};


//getFavourite is used to get the list of favourite homes from the favourite.json file and then filter the registered homes based on the favourite home ids and then render the favourite-list view with the filtered homes
exports.getFavourite = (req, res, next) => {
    const userId = req.session.user.id; // get the user id from the session
    User.findById(userId)
        .populate('favourites')
        .then(user => {
            res.render('store/favourite-list', {
                registeredHomes: user.favourites,
                pageTitle: 'Home-List',
                isLoggedIn: req.isLoggedIn,
                currentPage: 'favourite-list',
                user: req.session.user
            });
        });
};


//post add to favourirs , create a new favourite object and save it to the mongodb database and then redirect to the favourites page
exports.postAddToFavourite = async (req, res, next) => {
    const userId = req.session.user.id; // get the user id from the session
    const homeId = req.body.id;

    const user = await User.findById(userId);
    if(!user.favourites.includes(homeId)) {
        user.favourites.push(homeId);
        await user.save();
    }
    res.redirect("/favourites");

};

exports.postRemoveFromFavourite = async(req, res, next) => {
    const userId = req.session.user.id; // get the user id from the session
    const homeId = req.params.homeId;
    const user = await User.findById(userId);
    if(user.favourites.includes(homeId)) {
        user.favourites = user.favourites.filter(fav => fav != homeId);
        // user.favourites.pull(homeId);
        await user.save();
    }
    res.redirect("/favourites");
};



exports.getHomedetails = (req, res, next) => {
    //Using the dynamic path to get the homeId from the url
    //Using req.params to get the dynamic path value
    const homeId = req.params.homeId;
    console.log("At Home Details page : ", homeId);

    Home.findById(homeId)
        .then((home) => {
            if (!home) {
                console.log("Home not Found");
                res.redirect('/homes');
            }
            else {
                console.log("Home Found : ", home);
                res.render('store/home-detail', {
                    home: home, // here home means home object which is found by the id and passed to the view
                    pageTitle: 'Home details',
                    isLoggedIn: req.isLoggedIn,
                    currentPage: 'Home-List',
                    user: req.session.user
                })
            }
        });
};




