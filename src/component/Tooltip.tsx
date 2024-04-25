interface Props {
  children: React.ReactNode;
}

export default function Tooltip({ children }: Props) {
  return <div className="tooltip">{children}</div>;
}
