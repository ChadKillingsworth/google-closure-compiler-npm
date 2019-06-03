#!/usr/bin/env node
/*
 * Copyright 2018 The Closure Compiler Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
/**
 * @fileoverview
 *
 * Build the graal native compiler image for the current OS.
 * Intended to be run with a working directory of the intended package.
 */

const fs = require('fs');
const path = require('path');
const {
  GRAAL_OS,
  GRAAL_FOLDER,
  GRAAL_VERSION,
  GRAAL_PACKAGE_SUFFIX,
  GRAAL_URL
} = require('./graal-env');
const TEMP_PATH = path.resolve(__dirname, '../temp');
const runCommand = require('./run-command');

// This script should catch and handle all rejected promises.
// If it ever fails to do so, report that and exit immediately.
process.on('unhandledRejection', error => {
  console.error(error);
  process.exit(1);
});

// Build graal from source
if (!fs.existsSync(TEMP_PATH)) {
  fs.mkdirSync(TEMP_PATH);
}

const NATIVE_IMAGE_BUILD_ARGS = [
  '-H:+JNI',
  '--no-server',
  '-H:+ReportUnsupportedElementsAtRuntime',
  '-H:IncludeResourceBundles=com.google.javascript.rhino.Messages',
  '-H:IncludeResourceBundles=org.kohsuke.args4j.Messages',
  '-H:IncludeResourceBundles=org.kohsuke.args4j.spi.Messages',
  '-H:IncludeResourceBundles=com.google.javascript.jscomp.parsing.ParserConfig',
  `-H:ReflectionConfigurationFiles=${path.resolve(__dirname, 'reflection-config.json')}`,
  '-H:IncludeResources=(externs.zip)|(.*(js|txt))',
  '-jar',
  path.resolve(process.cwd(), 'compiler.jar')
];
let buildSteps = Promise.resolve();
// Download Graal
const GRAAL_ARCHIVE_FILE = `${GRAAL_FOLDER}.${GRAAL_PACKAGE_SUFFIX}`;
// Build the compiler native image.
const GRAAL_BIN_FOLDER = path.resolve(
    TEMP_PATH,
    `graalvm-ce-${GRAAL_VERSION}`,
    ...(GRAAL_OS === 'darwin' ? ['Contents', 'Home'] : []).concat(['bin']));
if (!fs.existsSync(path.resolve(TEMP_PATH, GRAAL_FOLDER))) {
  const GRAAL_GU_PATH = path.resolve(GRAAL_BIN_FOLDER, 'gu');
  buildSteps = buildSteps
      .then(() => {
        // Download graal and extract the contents
        if (!fs.existsSync(path.resolve(TEMP_PATH, GRAAL_ARCHIVE_FILE))) {
          process.stdout.write(`Downloading graal from ${GRAAL_URL}\n`);
          return runCommand(
              `curl --fail --show-error --location --progress-bar --output ${GRAAL_ARCHIVE_FILE} ${GRAAL_URL}`,
              {cwd: TEMP_PATH});
        }
      })
      .then(() => {
        if (GRAAL_PACKAGE_SUFFIX === 'tar.gz') {
          return runCommand(`tar -xzf ${GRAAL_ARCHIVE_FILE}`, {cwd: TEMP_PATH});
        }
        return runCommand(`7z e ${GRAAL_ARCHIVE_FILE}`, {cwd: TEMP_PATH});
      })
      .then(() => {
        if (GRAAL_OS === 'windows') {
          return Promise.resolve();
        }
        return runCommand(`${GRAAL_GU_PATH} install native-image`);
      });
}

// Build the compiler native image.
const GRAAL_NATIVE_IMAGE_PATH = path.resolve(
    GRAAL_BIN_FOLDER,
    'native-image');

// Unlike the mx launched version, the native binary must not have quotes around arguments
buildSteps = buildSteps.then(
    () => runCommand(`${GRAAL_NATIVE_IMAGE_PATH} ${NATIVE_IMAGE_BUILD_ARGS.join(' ')}`));
