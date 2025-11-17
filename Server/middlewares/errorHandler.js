module.exports = (err, req, res, next) => {
    console.error(err); // reemplazar por logger en producción
  
    const status = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';
    const details = err.errors || undefined;
  
    return res.status(status).json({
      success: false,
      message,
      ...(details ? { details } : {}),
    });
  };