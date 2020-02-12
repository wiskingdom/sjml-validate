# etri-cli usage guide

## 1. Install node.js (prerequisite)

### 1-1 On linux

#### 1) Install nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
```

#### 2) Restart terminal

#### 3) Install node LTS version

```bash
nvm install --lts
```

#### 4) Verify installation

```bash
node -v
npm -v
```

--------------------------

### 1-2 On windows

#### 1) Download LTS version installer

* Download Link: https://nodejs.org

#### 2) Install via the installer

#### 3) Verify installation

```cmd
node -v
npm -v
```
--------------------------

## 2. Install sjml-validate package

```bash
npm install sjml-validate -g
```
--------------------------

## 3. Usage

```bash
sjmlv [options]  // run validator
sjmlc [options]  // run converter
```

### 3.1 Validator 
#### Validator Options

| option  | description    |
|-----------|-------------|
| -s, --schema [schema_type ]   | set a schema type (required) |
| -i, --input [dir_path ]      | set an input dir path (required)     |
| -e, --ext [schema_type ]     | set an extention name of target input files (default: sjml) |
| -o, --output [dir_path ]    | set an output dir path (default: ./output/) |
| -w, --withEsc        | run validator with escaping: available with SERW, EXRW schema (default: without escaping) |
| -h, --help                  | output usage information            |

#### Validator Schema Type

| type | description |
|-------|---------|
|WXRW   | 원시 검증: 문어(상상, 정보, 기타)|
|WCRW | 원시 검증: 문어(잡지) |
|NXRW | 원시 검증: 신문|
|EXRW   | 원시 검증: 웹|
|SXRW | 원시 검증: 구어(공적독백, 공적대화) |
|SDRW | 원시 검증: 구어(일상대화) |
|SERW | 원시 검증: 준구어(대본)|
|MXRW | 원시 검증: 메신저대화|

--------------------------

### 3.2 Converter 
#### Converter Options

| option  | description    |
|-----------|-------------|
| -s, --schema [schema_type ]   | set a schema type (required) |
| -i, --input [dir_path ]      | set an input dir path (required)     |
| -e, --ext [schema_type ]     | set an extention name of target input files (default: sjml) |
| -o, --output [dir_path ]    | set an output dir path (default: ./output/) |
| -h, --help                  | output usage information            |

#### Converter Schema Type

| type | description |
|-------|---------|
|WXRW   | 원문->원시: 문어(상상, 정보, 기타)|
|WCRW | 원문->원시: 문어(잡지): |
|NXRW | 원문->원시: 신문|

--------------------------

## 4. Examples


```bash
sjmlv -s SDRW -i "..\데이터\일상대화" -e SJML 
sjmlv -s EXRW -i "..\데이터\웹" -o ..\output -w
```

```bash
sjmlc -s NXRW -i "..\데이터\신문" -e xml -o ..\output
```
