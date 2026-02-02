export default getApplicantRange = (count = 0) => {
  if (count === 0) return "Be the first to apply";
  if (count < 5) return "Less than 5 applicants";
  if (count < 10) return "5 to 10 applicants";
  if (count < 20) return "10 to 20 applicants";
  return "20+ applicants";
};
