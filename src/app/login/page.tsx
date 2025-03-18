const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log("Intentando iniciar sesión con:", username);
  
  try {
    const response = await fetch('/api/simple-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log("Inicio de sesión exitoso");
      router.push('/dashboard');
    } else {
      console.error("Error en inicio de sesión:", data.message);
      setError('Credenciales inválidas');
    }
  } catch (err) {
    console.error('Error de inicio de sesión:', err);
    setError('Error al iniciar sesión');
  }
};