const { Collection } = require("./jsonDB");

(async () => {
  const User = new Collection("Users", [
    "username",
    "email",
    "avatar",
    "password",
    "birthdate",
    "bio",
  ]);

  // await User.create({
  //   username: "test",
  // });

  // await User.update((doc) => doc.id == "1676635191801x485", {
  //   password: "xxx",
  // });

  // console.log(await User.findOne((doc) => doc.username == "Farid"));
  console.log(await User.find());
})();
