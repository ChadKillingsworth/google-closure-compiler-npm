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

const GRAAL_OS = process.platform === 'darwin' ? 'macos' : process.platform;
const GRAAL_VERSION = process.env.GRAAL_VERSION || '1.0.0-rc7';
const GRAAL_FOLDER = `graalvm-ce-${GRAAL_VERSION}-${GRAAL_OS}-amd64`;
const GRAAL_URL = process.env.GRAAL_URL ||
    `https://github.com/oracle/graal/releases/download/vm-${GRAAL_VERSION}/${GRAAL_FOLDER}.tar.gz`;

module.exports = {
  GRAAL_OS,
  GRAAL_VERSION,
  GRAAL_FOLDER,
  GRAAL_URL
};
