import React from "react";

export default function NumberRecognitionTable() {
  return (
    <>
      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">📋 Sistemas Numéricos</h2>
        <table className="table-auto border-collapse w-full text-center">
          <thead>
            <tr>
              <th className="border px-4 py-2">Sistema Numérico</th>
              <th className="border px-4 py-2">Letra Reconocida</th>
              <th className="border px-4 py-2">Secuencias Válidas</th>
              <th className="border px-4 py-2">Ejemplos</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Binario</td>
              <td className="border px-4 py-2">b | B</td>
              <td className="border px-4 py-2">[0-1]</td>
              <td className="border px-4 py-2">b"1111"</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Ternario</td>
              <td className="border px-4 py-2">t | T</td>
              <td className="border px-4 py-2">[0-2]</td>
              <td className="border px-4 py-2">T"12"</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Cuaternario</td>
              <td className="border px-4 py-2">c | C</td>
              <td className="border px-4 py-2">[0-3]</td>
              <td className="border px-4 py-2">c"22"</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Quinario</td>
              <td className="border px-4 py-2">q | Q</td>
              <td className="border px-4 py-2">[0-4]</td>
              <td className="border px-4 py-2">-q"11"</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Senario</td>
              <td className="border px-4 py-2">x | X</td>
              <td className="border px-4 py-2">[0-5]</td>
              <td className="border px-4 py-2">x"100"</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Heptal</td>
              <td className="border px-4 py-2">s | S</td>
              <td className="border px-4 py-2">[0-6]</td>
              <td className="border px-4 py-2">s"21"</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Octal</td>
              <td className="border px-4 py-2">o | O</td>
              <td className="border px-4 py-2">[0-7]</td>
              <td className="border px-4 py-2">o"7"</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Nonario</td>
              <td className="border px-4 py-2">n | N</td>
              <td className="border px-4 py-2">[0-8]</td>
              <td className="border px-4 py-2">N"81"</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Decimal</td>
              <td className="border px-4 py-2"> </td>
              <td className="border px-4 py-2">[0-9]</td>
              <td className="border px-4 py-2">100</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Hexadecimal</td>
              <td className="border px-4 py-2">h | H</td>
              <td className="border px-4 py-2">[0-9a-fA-F]</td>
              <td className="border px-4 py-2">H"F"</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Romano</td>
              <td className="border px-4 py-2">r | R</td>
              <td className="border px-4 py-2"> </td>
              <td className="border px-4 py-2">r"mmmCCXIV"</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4">
          Además, reconoce números decimales en cualquier sistema numérico, por
          ejemplo: <code>b"111.11"</code>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">
          📐 Extensión de los Números romanos
        </h2>
        <table className="table-auto border-collapse w-full text-center">
          <thead>
            <tr>
              <th className="border px-4 py-2">Letra</th>
              <th className="border px-4 py-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">(i|I)</td>
              <td className="border px-4 py-2">1</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">(v|V)</td>
              <td className="border px-4 py-2">5</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">(x|X)</td>
              <td className="border px-4 py-2">10</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">(l|L)</td>
              <td className="border px-4 py-2">50</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">(c|C)</td>
              <td className="border px-4 py-2">100</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">(d|D)</td>
              <td className="border px-4 py-2">500</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">(m|M)</td>
              <td className="border px-4 py-2">1,000</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4">
          Pero esto solo nos permite representar hasta la cantidad 3 999. La
          siguiente extensión nos permite trabajar con el límite de 3 999 999
          999, aunque por consola solo se pueda ingresar hasta el 399 999 999:
        </p>

        <table className="table-auto border-collapse w-full text-center">
          <thead>
            <tr>
              <th className="border px-4 py-2">Letra</th>
              <th className="border px-4 py-2">Valor</th>
              <th className="border px-4 py-2">Impresión</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">(n|N)</td>
              <td className="border px-4 py-2">5,000</td>
              <td className="border px-4 py-2">ṽ</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">(o|O)</td>
              <td className="border px-4 py-2">10,000</td>
              <td className="border px-4 py-2">Ẋ</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">(p|P)</td>
              <td className="border px-4 py-2">50,000</td>
              <td className="border px-4 py-2">Ḻ</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">(q|Q)</td>
              <td className="border px-4 py-2">100,000</td>
              <td className="border px-4 py-2">ĉ</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">(r|R)</td>
              <td className="border px-4 py-2">500,000</td>
              <td className="border px-4 py-2">ↁ</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">(s|S)</td>
              <td className="border px-4 py-2">1,000,000</td>
              <td className="border px-4 py-2">ṁ</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">(t|T)</td>
              <td className="border px-4 py-2">5,000,000</td>
              <td className="border px-4 py-2">Ṽ</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">(u|U)</td>
              <td className="border px-4 py-2">10,000,000</td>
              <td className="border px-4 py-2">Ẍ</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">(w|W)</td>
              <td className="border px-4 py-2">50,000,000</td>
              <td className="border px-4 py-2">Ḹ</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">(y|Y)</td>
              <td className="border px-4 py-2">100,000,000</td>
              <td className="border px-4 py-2">ḉ</td>
            </tr>
            <tr>
              <td className="border px-4 py-2"></td>
              <td className="border px-4 py-2">500,000,000</td>
              <td className="border px-4 py-2">ↇ</td>
            </tr>
            <tr>
              <td className="border px-4 py-2"></td>
              <td className="border px-4 py-2">1,000,000,000</td>
              <td className="border px-4 py-2">Ṁ</td>
            </tr>
          </tbody>
        </table>

        <p className="mt-4">
          Nota: Solo representa números romanos enteros; la parte decimal se
          omite.
        </p>
      </section>
    </>
  );
}
