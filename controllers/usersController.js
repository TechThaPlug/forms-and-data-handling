const { body, validationResult, matchedData } = require("express-validator");
const usersStorage = require("../storages/usersStorage");

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 10 characters.";

const validateUser = [
  body("firstName")
    .trim()
    .isAlpha()
    .withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`First name ${lengthErr}`),

  body("lastName")
    .trim()
    .isAlpha()
    .withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`Last name ${lengthErr}`),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Email must be formatted properly."),

  body("age")
    .optional({ values: "falsy" })
    .isInt({ min: 18, max: 120 })
    .withMessage("Age must be a number between 18 and 120."),

  body("bio")
    .optional({ values: "falsy" })
    .isLength({ max: 200 })
    .withMessage("Bio must be 200 characters or fewer."),
];

exports.usersListGet = (req, res) => {
  res.render("index", {
    title: "User list",
    users: usersStorage.getUsers(),
  });
};

exports.usersCreateGet = (req, res) => {
  res.render("createUser", {
    title: "Create user",
  });
};

exports.usersCreatePost = [
  validateUser,
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("createUser", {
        title: "Create user",
        errors: errors.array(),
      });
    }

    const { firstName, lastName, email, age, bio } = matchedData(req);

    usersStorage.addUser({
      firstName,
      lastName,
      email,
      age,
      bio,
    });

    res.redirect("/");
  },
];

exports.usersUpdateGet = (req, res) => {
  const user = usersStorage.getUser(req.params.id);

  res.render("updateUser", {
    title: "Update user",
    user,
  });
};

exports.usersUpdatePost = [
  validateUser,
  (req, res) => {
    const user = usersStorage.getUser(req.params.id);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("updateUser", {
        title: "Update user",
        user,
        errors: errors.array(),
      });
    }

    const { firstName, lastName, email, age, bio } = matchedData(req);

    usersStorage.updateUser(req.params.id, {
      firstName,
      lastName,
      email,
      age,
      bio,
    });

    res.redirect("/");
  },
];

exports.usersDeletePost = (req, res) => {
  usersStorage.deleteUser(req.params.id);
  res.redirect("/");
};

exports.usersSearchGet = (req, res) => {
  const name = (req.query.name || "").trim().toLowerCase();
  const email = (req.query.email || "").trim().toLowerCase();

  const users = usersStorage.getUsers();

  const results = users.filter((user) => {
    const matchesName =
      name === "" ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(name);

    const matchesEmail =
      email === "" || user.email.toLowerCase().includes(email);

    return matchesName && matchesEmail;
  });

  res.render("search", {
    title: "Search users",
    users: results,
    name: req.query.name || "",
    email: req.query.email || "",
  });
};
