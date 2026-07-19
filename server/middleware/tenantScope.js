const { Environment, Tenant } = require("../models");

const tenantScope = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required for tenant scope" });
    }

    const tenantId = req.user.tenantId;
    let targetEnvType = (req.headers["x-environment"] || "production").toLowerCase();
    
    // Tester role is ALWAYS locked to sandbox — no exceptions
    if (req.user.role === "Tester") {
      targetEnvType = "sandbox";
    }

    if (!["production", "sandbox"].includes(targetEnvType)) {
      return res.status(400).json({ error: "Invalid X-Environment header. Must be 'production' or 'sandbox'." });
    }

    // Only Owner, SuperAdmin, and Tester can switch to sandbox
    if (targetEnvType === "sandbox") {
      if (!["Owner", "SuperAdmin", "Tester"].includes(req.user.role)) {
        return res.status(403).json({ error: "Only Owner, SuperAdmin, and Tester can access Sandbox" });
      }

      // Check if tenant has sandbox enabled (skip for Tester — they were created via sandbox)
      if (req.user.role !== "Tester") {
        const tenant = await Tenant.findByPk(tenantId);
        if (!tenant || !tenant.sandboxEnabled || !tenant.allowEnvironmentSwitch) {
          return res.status(403).json({ error: "Sandbox is disabled for this tenant" });
        }
      }
    }

    // Find the environment for this tenant
    const env = await Environment.findOne({
      where: { tenantId, type: targetEnvType }
    });

    if (!env) {
      return res.status(404).json({ error: `Environment '${targetEnvType}' not found` });
    }

    req.tenantId = tenantId;
    req.environmentId = env.id;
    req.environmentType = env.type; // Useful for logging or conditional logic
    
    next();
  } catch (err) {
    console.error("TenantScope error:", err);
    res.status(500).json({ error: "Server error during environment resolution" });
  }
};

module.exports = { tenantScope };
