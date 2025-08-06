export const getThemeStyles = (theme) => {
  const baseCard = 'p-6 shadow-md transition-all duration-300';
  const baseTabIcon = 'text-xl';
  const baseButton = 'py-2 px-4 rounded transition-all duration-300 font-medium';

  const styles = {
    dark: {
      card: `${baseCard} bg-[#1f1f1f] text-white border border-white/10`,
      tab: 'text-gray-300 hover:text-white hover:bg-indigo-600',
      activeTab: 'bg-indigo-700 text-white',
      tabIcon: `${baseTabIcon} text-indigo-400`,
      headerText: 'text-white',
      button: `${baseButton} bg-indigo-600 hover:bg-indigo-700 text-white`,
    },
    light: {
      card: `${baseCard} bg-white text-gray-800 border border-gray-300`,
      tab: 'text-gray-700 hover:text-indigo-600 hover:bg-gray-100',
      activeTab: 'bg-indigo-100 text-indigo-700',
      tabIcon: `${baseTabIcon} text-indigo-600`,
      headerText: 'text-gray-800',
      button: `${baseButton} bg-indigo-500 hover:bg-indigo-600 text-white`,
    },
    colorful: {
      card: `${baseCard} bg-white bg-opacity-80 text-gray-900 border border-gray-200`,
      tab: 'text-gray-800 hover:text-white hover:bg-indigo-500',
      activeTab: 'bg-indigo-600 text-white',
      tabIcon: `${baseTabIcon} text-indigo-700`,
      headerText: 'text-white drop-shadow-md',
      button: `${baseButton} bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-500 text-white hover:brightness-110`,
    },
  };

  return styles[theme];
};
