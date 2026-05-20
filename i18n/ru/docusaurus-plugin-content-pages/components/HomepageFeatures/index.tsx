import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Img: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Проблемы",
    Img: require("@site/static/img/problems.jpg").default,
    description: (
      <>
        <a href="https://nestjs.com/" target="_blank">
          NestJS
        </a>{" "}
        — отличный фреймворк, и с его помощью можно создавать замечательные вещи, но часто при разработке большого количества приложений в рамках одной организации мы получаем разную архитектуру приложений, структуру файлов и много дублирующегося кода.
      </>
    ),
  },
  {
    title: "Решения",
    Img: require("@site/static/img/solutions.jpg").default,
    description: (
      <>
        Коллекция утилит NestJS-mod разработана для унификации приложений и модулей, а также введения новых логических вариантов разделения ответственности между модулями (Core, Feature, Integration, System, Infrastructure).
      </>
    ),
  },
  {
    title: "Бонусы",
    Img: require("@site/static/img/bonuses.jpg").default,
    description: (
      <>
        Поскольку все части приложения унифицированы, вы можете создавать отчёты по всей инфраструктуре проекта. Примеры отчётов:{" "}
        <a
          href="https://github.com/nestjs-mod/nestjs-mod-example/blob/master/apps/app-name/INFRASTRUCTURE.MD"
          target="_blank"
        >
          nestjs-mod-example
        </a>
        ,{" "}
        <a
          href="https://github.com/nestjs-mod/nestjs-mod-contrib/blob/master/apps/example-nats-microservice/INFRASTRUCTURE.MD"
          target="_blank"
        >
          example-nats-microservice
        </a>
        ,{" "}
        <a
          href="https://github.com/nestjs-mod/nestjs-mod-contrib/blob/master/apps/example-prisma/INFRASTRUCTURE.MD"
          target="_blank"
        >
          example-prisma
        </a>
      </>
    ),
  },
];

function Feature({ title, Img, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <img src={Img} style={{ height: "200px" }} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
