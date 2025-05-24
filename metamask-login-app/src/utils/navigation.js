// utils/navigation.js
export const navigateToSignUp = () => {
  // Implementation depends on your routing solution
  // React Router example:
  // navigate('/signup');
  
  // Or simple redirect:
  window.location.href = '/signup';
};

export const showComingSoonMessage = (setErrorMessage) => {
  setErrorMessage("This feature is coming soon!");
  
  // Clear message after 3 seconds
  setTimeout(() => {
    setErrorMessage("");
  }, 3000);
};