export default function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`rounded-xl px-4 py-2 font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-soft transition ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
