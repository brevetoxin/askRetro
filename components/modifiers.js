'use strict';

class Modifiers {
  constructor(mods) {
    this.mods = [];
    for (let i = 1; i < mods.length; i++) {
      this.mods.push(mods[i]);
    }
    return this;
  }

  check(regex) {
    return this.mods.find(mod => mod.match(regex))
  }
};

module.exports = Modifiers;
