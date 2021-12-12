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
const Search = require('../models/searchModel');

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

exports.getGenders = asyncHandler(async (req, res, next) => {
  const malesCount = await User.find({
    sexe: 'm',
    type: 'employee',
  }).countDocuments();
  const femalesCount = await User.find({
    sexe: 'f',
    type: 'employee',
  }).countDocuments();
  const nonesCount = await User.find({
    sexe: 'none',
    type: 'employee',
  }).countDocuments();

  res.status(200).json({
    status: 'success',
    data: [
      {
        sexe: 'Male',
        count: malesCount,
      },
      {
        count: femalesCount,
        sexe: 'Female',
      },
      {
        count: nonesCount,
        sexe: 'None',
      },
    ],
  });
});

exports.getTopSearchedCities = asyncHandler(async (req, res, next) => {
  const analytics = await Search.aggregate([
    {
      $group: {
        _id: '$city',
        count: { $sum: 1 },
        results: { $push: '$$ROOT' },
      },
    },
    { $project: { _id: 0, city: '$_id', count: 1 } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);
  res.status(200).json({
    status: 'success',
    data: analytics,
  });
});
exports.getTopSearchedServices = asyncHandler(async (req, res, next) => {
  const analytics = await Search.aggregate([
    {
      $group: {
        _id: '$service',
        count: { $sum: 1 },
        results: { $push: '$$ROOT' },
      },
    },
    { $project: { _id: 0, service: '$_id', count: 1 } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);
  res.status(200).json({
    status: 'success',
    data: analytics,
  });
});

exports.getSearches = asyncHandler(async (req, res, next) => {
  const analytics = await Search.aggregate([
    {
      $group: {
        _id: {
          service: '$service',
          city: '$city',
        },
        count: { $sum: 1 },
        results: { $push: '$$ROOT' },
      },
    },
    {
      $project: {
        _id: 0,
        service: '$_id.service',
        city: '$_id.city',
        count: 1,
      },
    },
    { $sort: { count: -1 } },
    { $limit: 100 },
  ]);
  res.status(200).json({
    status: 'success',
    data: analytics,
  });
});
