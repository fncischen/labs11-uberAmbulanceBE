const router = require("express").Router();
const Users = require("../models/user-model.js");

// base url is /api/users, set in server.js
router.get("/", async (req, res) => {
  const { user_id } = req.user;
  const [user] = await Users.findBy({ firebase_id: user_id });
  // console.log(user_id);
  try {
    if (user) {
      // user found return mother/driver data if exists
      if (user.user_type === "mothers") {
        const [motherData] = await Users.findMothersBy({
          firebase_id: user_id
        });
        res.status(200).json({ user, motherData });
      } else if (user.user_type === "drivers") {
        const [driverData] = await Users.findDriversBy({
          firebase_id: user_id
        });
        res.status(200).json({ user, driverData });
      } else {
        // console.log("user found, ", user);
        res.status(200).json({ user });
      }
    } else {
      // no user found, create it
      // console.log("no user, creating");
      const newUser = {
        firebase_id: user_id
      };
      userAdded = await Users.add(newUser);
      res.status(201).json({ user: userAdded });
    }
  } catch (error) {
    console.error("error finding by firebase_id: ", error);
    res.status(400).json({ message: error });
  }
});

router.post("/onboard/:id", async (req, res) => {
  // creates a mother/driver record corresponding to a user, user id passed as parameter
  const id = req.params.id;
  const userData = await Users.findById(id);
  if (userData.user_type) {
    res.status(400).json({ message: "This user has already been onboarded." });
    return;
  }
  const firebase_id = userData.firebase_id;
  let updated;
  try {
    if (req.body.user_type === "mother") {
      const motherData = { ...req.body.motherData, firebase_id };
      // first update user record
      await Users.updateUser({ id }, { user_type: "mothers" });
      // second create mother record
      updated = await Users.addMother(motherData);
      res.status(200).json({ mother: updated });
    } else if (req.body.user_type === "driver") {
      const driverData = { ...req.body.driverData, firebase_id };
      // first update user record
      await Users.updateUser({ id }, { user_type: "drivers" });
      // second create driver record
      updated = await Users.addDriver(driverData);
      res.status(200).json({ driver: updated });
    } else {
      res
        .status(400)
        .json({ message: "must set 'user_type' 'mothers' or 'drivers'." });
    }
  } catch (error) {
    console.error("error with POST to /onboard: ", error);
    res.status(400).json({ message: error });
  }
});

router.put("/update/:id", async (req, res) => {
  // updates user data, mother or driver data of that user if included
  let id = req.params.id;
  // check if user exists
  const user = await Users.findById(id);
  if (!user) {
    res.status(400).json({ message: "User does not exist." });
    return;
  }
  // if user type is not set and mother/driver data is included, need to go to onboarding instead
  if (!user.user_type && (req.body.mother || req.body.driver)) {
    res.status(400).json({
      message:
        "you can not update mother or driver data if the user has not been onboarded."
    });
    return;
  }

  try {
    // if user data included, update user
    if (req.body.user) {
      let update = { ...req.body.user };
      const [updatedUser] = await Users.updateUser({ id }, update);
      // check if user updated
      if (updatedUser) {
        // if no mother/driver, return updated
        if (!req.body.mother && !req.body.driver) {
          res.status(200).json({ message: `User ${updatedUser} updated` });
          return;
        }
      } else {
        // user failed to update
        throw "User failed to update";
      }
    }
    // if mother data included, update mother
    if (req.body.mother) {
      // find mother id
      firebase_id = user.firebase_id;
      const [mother] = await Users.findMothersBy({ firebase_id });
      if (!mother) {
        // no mother matching user's firebase id
        res
          .status(400)
          .json({ message: "The user id does not correspond to any mother." });
        return;
      }
      // update mother
      id = mother.id;
      const [updatedMother] = await Users.updateMother(
        { id },
        { ...req.body.mother }
      );
      res.status(200).json({ message: `Mother ${updatedMother}  updated.` });
      return;
    }
    // if driver data included, update driver
    if (req.body.driver) {
      // find driver id
      firebase_id = user.firebase_id;
      const [driver] = await Users.findDriversBy({ firebase_id });
      if (!driver) {
        // no driver matching user's firebase id
        res
          .status(400)
          .json({ message: "The user id does not correspond to any driver." });
        return;
      }
      // update driver
      id = driver.id;
      const [updatedDriver] = await Users.updateDriver(
        { id },
        { ...req.body.driver }
      );
      res.status(200).json({ message: `Driver ${updatedDriver}  updated.` });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
});

module.exports = router;
