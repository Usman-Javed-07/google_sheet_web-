function validate(schema, source='body') {
  return (req, res, next) => {
    const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    req.valid = Object.assign(req.valid || {}, { [source]: parsed.data });
    next();
  };
}
module.exports = { validate };