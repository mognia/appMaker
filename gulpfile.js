var gulp = require("gulp");
var ts = require("gulp-typescript");
var fs = require("fs-extra");
var mocha = require("gulp-mocha");
var child = require("child_process");
var typedoc = require("gulp-typedoc");

var paths = {
  dist: "dist",
  tsSources: "src/**/*.ts",
  tests: "dist/tests/*.js"
};

// compile typescripts
function build() {
  if (fs.existsSync(paths.dist)) {
    fs.emptyDirSync(paths.dist);
  }

  return gulp
    .src(paths.tsSources)
    .pipe(
      ts({
        noImplicitAny: false,
        target: "ES2015",
        sourceMap: true,
        module: "CommonJS",
        baseUrl: ".",
        paths: {
          "*": ["node_modules/*", "src/types/*"]
        }
      })
    )
    .pipe(gulp.dest(paths.dist));
}

function typedoc() {
  return gulp
    .src([
      paths.tsSources,
      "./node_modules/serendip-business-model/src/auth/*.ts",
      "./node_modules/serendip-business-model/src/db/*.ts",
      "./node_modules/serendip-business-model/src/Server*.ts"
    ])
    .pipe(
      typedoc({
        // TypeScript options (see typescript docs)
        module: "commonjs",
        target: "es2017",

        includeDeclarations: true,
        excludePrivate: true,
        excludeProtected: true,
        excludeExternals: true,
        readme: "doc.md",
        hideGenerator: true,
        exclude: ["./src/app.ts", "*/**/index.ts"],
        // Output options (see typedoc docs)
        out: "./doc",
        json: "./doc.json",

        // TypeDoc options (see typedoc docs)
        name: "Serendip Business API",
        // theme: "minimal",
        theme: "markdown",
        ignoreCompilerErrors: false,
        version: true
      })
    );
}
function handleError(err) {
  console.log(err.toString());
  this.emit("end");
}
function test() {
  return gulp.src([paths.tests], { read: false }).pipe(
    mocha({
      reporter: "spec",
      exit: true
    }).on("error", handleError)
  );
}

let server;

function run(done) {
  if (server) if (server.kill) server.kill();

  let childProcess = child.spawn("node", ["./dist/start.js"], {
    stdio: "inherit",
    env: {
      ...process.env
    }
  });

  server = childProcess;

  done();
}

gulp.watch(paths.tsSources, gulp.series(build, run, test));

exports.test = gulp.series(build, test, async () => {});
exports.build = gulp.series(build);
exports.default = gulp.series(build, run, test);
