import {
  type Opt,
  Entity,
  PrimaryKey,
  Property,
  ReflectMetadataProvider,
} from "@mikro-orm/core";
import { MikroORM, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Factory } from "@mikro-orm/seeder";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

@Entity()
class Test {
  @PrimaryKey({ type: "number" })
  id!: number;

  @Property({ type: "timestamp", length: 0, fieldName: "utc_only_please" })
  utcOnlyPlease!: Opt<Date>;
}

class TestFactory extends Factory<Test> {
  model = Test;

  definition(): Partial<Test> {
    return {
      utcOnlyPlease: dayjs.utc("2024-08-01").startOf("day").hour(17).toDate(),
    };
  }
}

const test = async () => {
  const orm = await MikroORM.init({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "hirefast",
    dbName: "mikro-orm-date-bug",
    driver: PostgreSqlDriver,
    metadataProvider: ReflectMetadataProvider,
    allowGlobalContext: true,
    implicitTransactions: false,
    debug: true,
    entities: [Test],
  });

  const em = orm.em;

  await em.begin();

  const testEntity = await new TestFactory(orm.em).createOne();

  console.log({ testEntity });

  em.clear();

  const managedEntity = await em.getRepository(Test).findOne(testEntity.id);

  console.log({
    managedEntity,
  });

  await em.rollback();
  em.clear();
  await orm.close();
};

test();
