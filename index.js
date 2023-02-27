const { Collection } = require("./libs/database");
(async () => {
  const users = new Collection("Users");
  // for (let index = 0; index < 10; index++) {
  //   await users.create({
  //     index,
  //   });
  // }

  // await users.update((doc) => doc.id === "1677504024480x666", { name: "Ali" });
  // await users.clear();
  console.log(
    await users.find({
      where: (a) => a.index === 3,
    })
  );
})();
