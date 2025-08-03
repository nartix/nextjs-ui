import { Pagination } from '@mantine/core';
import { Link } from '@/i18n/routing';

export function CTIProductTable() {
  return (
    <div>
      <h1>CTI Product Table</h1>
      <Pagination
        total={20}
        siblings={1}
        defaultValue={10}
        getItemProps={(page) => ({
          component: Link,
          href: `#page-${page}`,
        })}
      />
    </div>
  );
}
