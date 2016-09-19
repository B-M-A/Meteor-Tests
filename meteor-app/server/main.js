import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { InfiniLoad } from "meteor/zodiase:infinite-load";

const db = new Mongo.Collection('data');
// Set indexes
db._ensureIndex({ createTime: 1 });
db._ensureIndex({ name: "text" });

Meteor.startup(() => {
  // code to run on server at startup

  const expectedDataCount = 40;
  const currentDataCount = db.find({}).count();
  console.log('currentDataCount', currentDataCount);
  // Create initial data.
  if (currentDataCount !== expectedDataCount) {
    console.log('Initializing data...');
    db.remove({});
    let time = Date.now();
    for (let i = 0; i < expectedDataCount; ++i) {
      db.insert({
        name: ['a', 'b', 'c'][i % 3],
        createTime: time + i
      });
    }
    console.log(`${expectedDataCount} data items inserted`);
  }

  const infDb = new InfiniLoad(db, {
    'selector' (userId, args) {
      const search = args.search || '';

      return search
      ? {
          '$text': {
            '$search': search
          }
        }
      : {};
    },
    verbose: true
  });

});
