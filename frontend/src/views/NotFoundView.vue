<template>
  <section id="section1">
    <div class="error-container">
      <div class="lottie-animation"></div>
      <div class="error-content">
        <h1>404</h1>
        <p>¡Oops! La página que buscas no existe.</p>
        <a href="/" class="btn btn-primary">Ir a Inicio</a>
      </div>
    </div>
  </section>
</template>
<style scoped>
  .error-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f8f9fa;
  }

  .error-content {
    text-align: center;
  }

  .error-content h1 {
    font-size: 6rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }

  .error-content p {
    font-size: 1.5rem;
    margin-bottom: 2rem;
  }

  .lottie-animation {
    max-width: 400px;
    margin-bottom: 2rem;
  }
</style>
