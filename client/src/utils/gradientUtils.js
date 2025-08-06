const gradients = [
  'from-blue-400 via-teal-400 to-green-300',
  'from-indigo-400 via-purple-400 to-blue-300',
  'from-yellow-300 via-orange-400 to-red-400',
  'from-cyan-400 via-blue-300 to-indigo-300',
  'from-lime-300 via-green-400 to-emerald-300',
  'from-sky-300 via-cyan-300 to-teal-300',
  'from-orange-400 via-amber-300 to-lime-300',
];

export function getRandomGradient() {
  const index = Math.floor(Math.random() * gradients.length);
  return gradients[index];
}
