export function ExternalLink(props: { href: string; title: string }) {
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600 hover:text-blue-700 underline"
    >
      {props.title}
    </a>
  )
}
