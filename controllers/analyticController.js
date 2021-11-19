// Thirs-party libraries
const moment = require('moment');

// Utils
const asyncHandler = require('../utils/asyncHandler');

// Models
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const Appointment = require('../models/appointmentModel');
const Contract = require('../models/contractModel');
const Contact = require('../models/contactModel');
const Report = require('../models/reportModel');

exports.getCounts = asyncHandler(async (req, res, next) => {
  const employeesCount = await User.find({
    type: 'employee',
  }).countDocuments();
  const clientsCount = await User.find({ type: 'client' }).countDocuments();
  const reviewsCount = await Review.countDocuments();
  const contactsCount = await Contact.countDocuments();
  const contractsCount = await Contract.countDocuments();
  const appointmentsCount = await Appointment.countDocuments();

  res.status(200).json({
    status: 'success',
    data: {
      employees: employeesCount || 0,
      clients: clientsCount || 0,
      reviews: reviewsCount || 0,
      contacts: contactsCount || 0,
      contracts: contractsCount || 0,
      appointments: appointmentsCount || 0,
    },
  });
});

exports.getAnalytics = asyncHandler(async (req, res, next) => {
  const lastWeek = moment().subtract(6, 'days');

  const results = [];

  const lastSevenDaysEmployees = await User.find({
    type: 'employee',
    createdAt: { $gte: moment().subtract(6, 'days') },
  });

  const lastSevenDaysClients = await User.find({
    type: 'client',
    createdAt: { $gte: moment().subtract(6, 'days') },
  });

  for (let i = lastWeek.day(); i <= lastWeek.day() + 6; i++) {
    results.push({
      name: 'employees',
      day: moment().day(i).format('dddd'),
      count: lastSevenDaysEmployees.filter(
        (e) => moment(e.createdAt).day() == moment({ day: i }).day()
      ).length,
    });

    results.push({
      name: 'clients',
      day: moment().day(i).format('dddd'),
      count: lastSevenDaysClients.filter(
        (e) => moment(e.createdAt).day() == moment({ day: i }).day()
      ).length,
    });
  }

  res.status(200).json({
    status: 'success',
    data: results,
  });
});
