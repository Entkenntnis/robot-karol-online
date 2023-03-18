export function HFullStyle() {
  return (
    <>
      <style jsx global>
        {`
          body,
          html,
          #__next {
            height: 100%;
          }
        `}
      </style>
    </>
  )
}
