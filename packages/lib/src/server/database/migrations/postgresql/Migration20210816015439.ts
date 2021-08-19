import { Migration } from '@mikro-orm/migrations';

export class Migration20210816015439 extends Migration {
    up(): Promise<void> {
        this.addSql( `
            create table "uielement" (
                "uuid" varchar(255) not null,
                "feature" varchar(255) not null,
                "scenario" varchar(255) not null,
                "locator" varchar(255) not null,
                "content" varchar(255) not null,
                "created_at" timestamptz(0) not null,
                "updated_at" timestamptz(0) not null
            );
        ` );

        this.addSql( `
            alter table "uielement"
            add constraint "uielement_pkey" primary key ("uuid");
        ` );

        this.addSql( `
            create table "healing_result" (
                "uuid" varchar(255) not null,
                "new_locator" varchar(255) not null,
                "score" int4 not null,
                "successful" bool not null,
                "applied" bool not null,
                "logged" bool not null,
                "created_at" timestamptz(0) not null,
                "element_uuid" varchar(255) not null
            );
        ` );

        this.addSql( `
            alter table "healing_result"
            add constraint "healing_result_pkey" primary key ("uuid");
        ` );

        this.addSql( `
            alter table "healing_result"
            add constraint "healing_result_element_uuid_foreign" foreign key ("element_uuid")
            references "uielement" ("uuid") on update cascade;
        ` );

        return Promise.resolve();
    }
}
