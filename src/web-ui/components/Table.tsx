import type { ComponentChildren } from 'preact';

interface TableProps {
  children: ComponentChildren;
  elevated?: boolean;
  compact?: boolean;
}

interface TableContainerProps {
  children: ComponentChildren;
  scrollable?: boolean;
  elevated?: boolean;
}

interface TableHeadProps {
  children: ComponentChildren;
  sticky?: boolean;
  dark?: boolean;
}

interface TableRowProps {
  children: ComponentChildren;
}

interface TableHeaderProps {
  children: ComponentChildren;
  compact?: boolean;
  styled?: boolean;
}

interface TableCellProps {
  children: ComponentChildren;
  compact?: boolean;
  scorePositive?: boolean;
  scoreNegative?: boolean;
}

export const Table = ({ children, elevated = false, compact = false }: TableProps) => {
  const classes = ['table', elevated && 'table--elevated', compact && 'table--compact'].filter(Boolean).join(' ');

  return <table className={classes}>{children}</table>;
};

export const TableContainer = ({ children, scrollable = false, elevated = false }: TableContainerProps) => {
  const classes = [
    'table__container',
    scrollable && 'table__container--scrollable',
    elevated && 'table__container--elevated',
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
};

export const TableHead = ({ children, sticky = false, dark = false }: TableHeadProps) => {
  const classes = ['table__head', sticky && 'table__head--sticky', dark && 'table__head--dark']
    .filter(Boolean)
    .join(' ');

  return (
    <thead className={classes}>
      <tr>{children}</tr>
    </thead>
  );
};

export const TableRow = ({ children }: TableRowProps) => <tr className="table__row">{children}</tr>;

export const TableHeader = ({ children, compact = false, styled = false }: TableHeaderProps) => {
  const classes = ['table__header', compact && 'table__header--compact', styled && 'table__header--styled']
    .filter(Boolean)
    .join(' ');

  return <th className={classes}>{children}</th>;
};

export const TableCell = ({
  children,
  compact = false,
  scorePositive = false,
  scoreNegative = false,
}: TableCellProps) => {
  const classes = [
    'table__cell',
    compact && 'table__cell--compact',
    scorePositive && 'table__cell--score-positive',
    scoreNegative && 'table__cell--score-negative',
  ]
    .filter(Boolean)
    .join(' ');

  return <td className={classes}>{children}</td>;
};
