exports.validateAuth = (req, res, next) => {
  const { publicAddress, signature } = req.body;

  if (!publicAddress || !signature) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Validate ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(publicAddress)) {
    return res.status(400).json({ error: "Invalid Ethereum address format" });
  }

  next();
};

exports.validateAddress = (req, res, next) => {
  const { publicAddress } = req.query;

  if (!publicAddress) {
    return res.status(400).json({ error: "Public address is required" });
  }

  // Validate ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(publicAddress)) {
    return res.status(400).json({ error: "Invalid Ethereum address format" });
  }

  next();
};
