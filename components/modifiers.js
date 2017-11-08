'use strict';

class Modifiers {
  constructor(mods) {
    this.mods = [];
    for (let i = 0; i < mods.length; i++) {
      this.mods.push(mods[i]);
    }
    return this;
  }

  check(regex) {
    return this.mods.find(mod => {
      mod = mod.replace(/#/g, '');
      return mod.match(regex)
    });
  }
};

module.exports = Modifiers;
