import { ObjectLiteral, Repository } from 'typeorm';

export async function getNextNumericId<T extends ObjectLiteral>(
  repo: Repository<T>,
  alias = 'row',
): Promise<number> {
  const result = await repo
    .createQueryBuilder(alias)
    .select(`COALESCE(MAX(${alias}.id), 0)`, 'maxId')
    .getRawOne<{ maxId: string | number }>();

  return Number(result?.maxId ?? 0) + 1;
}
