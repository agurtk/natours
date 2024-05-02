const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};
//          this 2 function are the same
// const catchAsync = (fn) => {
//   return (req, res, next) => {
//     fn(req, res, next).catch((err) => next(err));
//   };
// };

module.exports = catchAsync;
