<template>
  <div class="spinner-wrapper">
    <div class="spinner">
      <div class="spinner-inner"></div>
    </div>
    <p class="loading-text">Chargement...</p>
  </div>
</template>

<style scoped>
.spinner-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  transition: background-color 0.2s ease-in-out;
  background-color: var(--color-bg);
  gap: 1rem;
}

.loading-text {
  color: var(--color-text);
  font-size: 0.875rem;
  opacity: 0.8;
}

.spinner {
  width: 40px;
  height: 40px;
  position: relative;
}

.spinner-inner {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-inner::before,
.spinner-inner::after {
  content: "";
  box-sizing: border-box;
  position: absolute;
  border: 3px solid transparent;
  border-radius: 50%;
}

.spinner-inner::before {
  top: -9px;
  left: -9px;
  right: -9px;
  bottom: -9px;
  border-top-color: var(--color-primary);
  opacity: 0.6;
  animation: spin 1.2s linear infinite reverse;
}

.spinner-inner::after {
  top: 3px;
  left: 3px;
  right: 3px;
  bottom: 3px;
  border-top-color: var(--color-primary);
  opacity: 0.8;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
