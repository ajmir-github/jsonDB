const { Collection } = require("./jsonDB");
(async () => {
  const User = new Collection("users", {
    head: ["id", "title"],
    body: ["body", "published"],
  });

  // await Users.create({
  //   id: 1,
  //   title: "CSS",
  //   body: "This will teach you how to work with css",
  //   published: false,
  // });

  console.log(User.headStorage);
})();
