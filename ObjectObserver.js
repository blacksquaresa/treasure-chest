// A class for watching existing objects. 
// Will not work if the initial object reference is updated
// Mostly untested
export class ObjectObserver {
  observe(obj, callback) {
    let path = '<root>';
    this._observeChildren(obj, path, callback);
    return this._createProxyFor(obj, path, callback);
  }

  _observeChildren(obj, path, callback) {
    // we deliberately want to mock all properties, not just own properties
    // eslint-disable-next-line guard-for-in
    for(let key in obj) {
      let childPath = `${path}.${key}`;
      let child = obj[key];
      if(typeof child === 'object') {
        try {
          this._observeChildren(child, childPath, callback);
          obj[key] = this._createProxyFor(child, childPath, callback);
        } catch {
          Granify.log(`Unable to create a proxy for ${childPath}`);
        }
      }
    }
  }

  _createProxyFor(obj, path, callback) {
    const proxy = new Proxy(obj, {
      set(target, prop, value) {
        const oldValue = target[prop];
        Reflect.set(...arguments);
        callback(target, path, prop, 'set', oldValue, value);
        return true;
      },
      get: (target, key) => {
        if (key !== '__isProxy') {
          return target[key];
        }

        return true;
      },
      deleteProperty(target, prop) {
        Reflect.delete(...arguments);
        callback(target, path, prop, 'delete');
        return true;
      },
    });
    return proxy;
  }
}
