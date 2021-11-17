// Third-party libraries
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['welcome', 'appointment', 'review', 'contract'],
    },

    notifiable: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    data: { type: Schema.Types.Mixed },

    read_at: { type: Date, default: null },
  },

  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtuals to check if the notification is read or not
notificationSchema.virtual('read').get(function () {
  const currentDate = new Date();
  if (this.read_at !== null && currentDate >= this.read_at) return true;
  return false;
});

notificationSchema.method('toClient', function (isAdmin, lang) {
  const obj = this.toObject({ getters: true });

  if (lang) {
    if (obj.data.message) {
      obj.data.message = obj.data.message[lang];
    }
  }

  //Rename fields
  delete obj._id;

  return obj;
});

module.exports = mongoose.model('Notification', notificationSchema);
