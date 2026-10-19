const express = require("express");

//Local Module
const storeController = require("../controllers/storeController");

const storeRouter = express.Router();


storeRouter.get("/", storeController.getIndex);
storeRouter.get("/homes", storeController.getHomes);

storeRouter.get("/bookings", storeController.getBookings);
storeRouter.get("/favourites", storeController.getFavourite);

storeRouter.get("/homes/:homeId", storeController.getHomedetails);

storeRouter.post("/favourites", storeController.postAddToFavourite);
storeRouter.post("/favourites/delete/:homeId", storeController.postRemoveFromFavourite);


module.exports = storeRouter;