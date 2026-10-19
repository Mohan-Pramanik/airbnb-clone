const Home = require('../models/home');
const fs = require('fs');




exports.getaddHome = (req, res, next) => {
    res.render('host/edit-home', {
        pageTitle: 'Add Home page',
        currentPage: 'addHome',
        editing: false,
        isLoggedIn: req.isLoggedIn,
        user: req.session.user
    });
};

exports.postaddHome = (req, res, next) => {

    const { houseName, price, location, rating, description } = req.body;
    console.log(req.files);

    const files = req.files || {};
    const photo = files.photo && files.photo[0];
    const rulesPDF = files.rulesPDF && files.rulesPDF[0];
    if (!photo) {
        return res.status(400).send('No file uploaded. Please upload an image.');
    }
    const photoPath = `Image/${photo.filename}`;
    const rulesPDFName = rulesPDF ? rulesPDF.filename : undefined;
    const home = new Home({
        houseName,
        price,
        location,
        rating,
        photo: photoPath,
        rulesPDF: rulesPDFName,
        description
    });
    home.save().then(() => {
        console.log("Home Saved successfully");
        res.redirect('/host/host-home-list');
    });


}

exports.getEditHome = (req, res, next) => {
    // homeId is come from the url params, which is defined in the routes file
    const homeId = req.params.homeId;
    const editing = req.query.editing === 'true';
    Home.findById(homeId)
        .then
        ((home) => {
            if (!home) {
                console.log("Home not extis for the editing");
                return res.redirect("/host/host-home-list");
            }
            console.log(homeId, editing, home);
            res.render('host/edit-home', {
                home: home,
                pageTitle: 'Edit Your Home',
                currentPage: 'host-homes',
                editing: editing,
                isLoggedIn: req.isLoggedIn,
                user: req.session.user
            });

        })

};

exports.postEditHome = (req, res, next) => {

    const { id, houseName, price, location, rating, description } = req.body;
    console.log("Received data for editing home:", req.body);


    // Home.findById(id).then((home) => {
    //     home.houseName = houseName;
    //     home.price = price;
    //     home.location = location;
    //     home.rating = rating;
    //     home.photo = photo;
    //     home.description = description; 
    //     home.save().then(() => {
    //         console.log("Home Updated successfully");
    //     }).catch((err) => {
    //         console.log("Error while updating the home : ", err);
    //     })
    //     res.redirect('/host/host-home-list');
    // }).catch((err) => {
    //     console.log("Error while finding the home for editing : ", err);
    // });

    const updateData = {
        houseName,
        price,
        location,
        rating,
        description,

    }

    const files = req.files || {};
    const photo = files.photo && files.photo[0];
    const rulesPDF = files.rulesPDF && files.rulesPDF[0];
    if (photo) {
        updateData.photo = `Image/${photo.filename}`;
    }
    if (rulesPDF) {
        updateData.rulesPDF = rulesPDF.filename;
    }
    Home.findByIdAndUpdate(id, updateData, { new: false })
        .then((home) => {
            if (!home) {
                return res.redirect('/host/host-home-list');
            }

            if (photo && home.photo && home.photo !== updateData.photo) {
                fs.unlink(home.photo, (err) => {
                    if (err && err.code !== 'ENOENT') {
                        console.log("Error while deleting the old photo:", err);
                    }
                });
            }

            console.log("Home Updated successfully");
            res.redirect('/host/host-home-list');
        })
        .catch((err) => {
            console.log("Error while updating the home:", err);
            next(err);
        });
}

exports.getHostHomes = (req, res, next) => {

    Home.find()
        .then((registeredHomes) => {
            res.render('host/host-home-list', { registeredHomes: registeredHomes, pageTitle: 'Host Home List', currentPage: 'host-homes', isLoggedIn: req.isLoggedIn, user: req.session.user });
        })
        .catch(err => console.log(err));
}







exports.postDeleteHome = (req, res, next) => {

    const homeId = req.params.homeId;
    console.log("came to detele home id ", homeId);
    Home.findByIdAndDelete(homeId)
        .then(() => {
            res.redirect('/host/host-home-list')
        }).catch((err) => {
            console.log("Error while deleting the home : ", err);
        })
}

