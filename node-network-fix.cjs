const net = require("node:net");

net.setDefaultAutoSelectFamily(false);

console.log(
  "[network] autoSelectFamily:",
  net.getDefaultAutoSelectFamily()
);
