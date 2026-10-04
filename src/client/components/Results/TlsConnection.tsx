import { Card } from 'client/components/Form/Card';
import Row from 'client/components/Form/Row';
import Heading from 'client/components/Form/Heading';
import colors from 'client/styles/colors';

const yesNo = (v: boolean) => (v ? '✅ Yes' : '❌ No');

// Each TLS version, with how to show it enabled and disabled
const VERSIONS = [
  ['TLSv1.3', 'TLS 1.3', '✅ Enabled', 'Disabled'],
  ['TLSv1.2', 'TLS 1.2', 'Enabled', 'Disabled'],
  ['TLSv1.1', 'TLS 1.1', '❌ Enabled', '✅ Disabled'],
  ['TLSv1', 'TLS 1.0', '❌ Enabled', '✅ Disabled'],
];

const formatEphemeralKey = (k: any): string => {
  if (!k?.type) return '';
  const parts = [k.type];
  if (k.name) parts.push(`(${k.name})`);
  if (k.size) parts.push(`${k.size}-bit`);
  return parts.join(' ');
};

const TlsConnectionCard = (props: {
  data: any;
  title: string;
  actionButtons: any;
}): JSX.Element => {
  const d = props.data || {};
  const cipherName = d.cipher?.standardName || d.cipher?.name || '';
  const ephemeral = formatEphemeralKey(d.ephemeralKey);
  return (
    <Card heading={props.title} actionButtons={props.actionButtons}>
      {d.protocol && <Row lbl="Protocol" val={d.protocol} />}
      {cipherName && <Row lbl="Cipher Suite" val={cipherName} />}
      {d.cipher?.version && <Row lbl="Cipher Version" val={d.cipher.version} />}
      {ephemeral && <Row lbl="Ephemeral Key" val={ephemeral} />}
      {d.alpnProtocol && <Row lbl="ALPN" val={d.alpnProtocol} />}
      <Row lbl="Forward Secrecy" val={yesNo(!!d.forwardSecrecy)} />
      <Row lbl="Session Resumption" val={yesNo(!!d.sessionResumption)} />
      <Row lbl="OCSP Stapling" val="">
        <span className="lbl">OCSP Stapling</span>
        <span className="val" style={{ color: colors.info }}>
          {d.ocspStapled ? 'ⓘ Present' : 'ⓘ Not Present (may impact visitor privacy)'}
        </span>
      </Row>
      <Row
        lbl="Certificate Trust"
        val={d.authorized ? '✅ Trusted' : `❌ ${d.authError || 'Untrusted'}`}
      />
      {d.versions && (
        <>
          <Heading as="h3" color={colors.primary} size="small">
            TLS Versions
          </Heading>
          {VERSIONS.map(([id, label, enabled, disabled]) => (
            <Row key={id} lbl={label} val={d.versions.includes(id) ? enabled : disabled} />
          ))}
        </>
      )}
    </Card>
  );
};

export default TlsConnectionCard;
