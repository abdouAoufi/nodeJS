const express = require("express"); // express framework
const path = require("path"); // file system module
const errorController = require("./controllers/error"); // controller
const adminRouter = require("./routes/admin"); // route
const shopRoutes = require("./routes/shop"); // route
const bodyParser = require("body-parser"); // tool to decode incoming requests ...
const sequelize = require("./util/database"); // data base
const app = express(); // start the app ....
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

// set up a view engine in our case is EJS
app.set("view engine", "ejs");
app.set("views", "views");

// connect models to each other ......
Product.belongsTo(User, { onDelete: "CASCADE", constrain: true });
User.hasMany(Product);

User.hasOne(Cart);
Cart.belongsTo(User);

Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

Order.belongsTo(User);
User.hasMany(Order);

Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user; // ! interesting object
      next();
    })
    .catch((err) => console.log(err));
});
// .sync()

sequelize
.sync({force : true})
  .then(() => {
    return User.findByPk(1); // gives us promise !
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: "Abdou", email: "Abdouou7@gmail.com" });
    }
    return user;
  })
  .then((user) => {
    return user.createCart();
  })
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));

// parse incoming requests ..
app.use(bodyParser.urlencoded({ extended: false }));

// use static files ....
app.use(express.static(path.join(__dirname, "public")));

// using middleware routers ...
app.use(shopRoutes);
app.use("/admin", adminRouter);
app.use(errorController.notFound);
