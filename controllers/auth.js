exports.getLogin = (req, res, next) => {
  // Get the value of isloggedin from the request header
  const isLoggedIn = req.headers.cookie.split(';').find(c => c.trim().startsWith('isLoggedIn='))?.split('=')[1]
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isLoggedIn: isLoggedIn
  });
};

exports.postLogin = (req, res, next) => {
  res.setHeader("Set-Cookie", "isLoggedIn=true");
  res.redirect("/");
};
