const deletButton = document.querySelector("button[class='btn']");
const csrfToken = document.querySelector("input[name='_csrf']").value;
const productId = document.querySelector("input[name='productId']").value;

deletButton.addEventListener("click", function (e) {
  // POST => /admin/delete-product

  fetch("/admin/delete-product/" + productId, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "csrf-token": csrfToken,
    },
  })
    .then((data) => {
      if (data.status === 200) {
        document.querySelector("#product-" + productId).remove();
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
