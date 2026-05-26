<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Order
 * 
 * @property int $id
 * @property string $order_code
 * @property int|null $flag_past_order
 * @property int $user_id
 * @property int $customer_id
 * @property int $address_id
 * @property int|null $coupon_id
 * @property int $sub_total
 * @property int $ongkos_kirim
 * @property int|null $potongan_ongkir
 * @property int $final_ongkir
 * @property int $total_price
 * @property int|null $upgrade_price
 * @property Carbon|null $upgrade_price_date
 * @property int $payment_id
 * @property int $sending_id
 * @property string|null $description
 * @property string $status
 * @property string $nama_rekening
 * @property string $special
 * @property int $potongan_khusus
 * @property string|null $nomor_resi
 * @property Carbon|null $tanggal_resi
 * @property string|null $sumber_lead
 * @property string|null $jenis_lead
 * @property int $kode
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $expedition
 * @property string|null $note
 * @property string|null $transfer_proof_url
 * @property Carbon|null $created_date
 * @property float|null $total_weight
 * @property string|null $shipping_order_id
 * @property string|null $shipping_provider
 * 
 * @property Address $address
 * @property Coupon|null $coupon
 * @property Customer $customer
 * @property Payment $payment
 * @property Sending $sending
 * @property User $user
 * @property Collection|OrderPhoto[] $order_photos
 * @property Collection|ReturnOrder[] $return_orders
 * @property Collection|TransferProof[] $transfer_proofs
 *
 * @package App\Models
 */
class Order extends Model
{
	protected $table = 'orders';

	protected $casts = [
		'flag_past_order' => 'int',
		'user_id' => 'int',
		'customer_id' => 'int',
		'address_id' => 'int',
		'coupon_id' => 'int',
		'sub_total' => 'int',
		'ongkos_kirim' => 'int',
		'potongan_ongkir' => 'int',
		'final_ongkir' => 'int',
		'total_price' => 'int',
		'upgrade_price' => 'int',
		'upgrade_price_date' => 'datetime',
		'payment_id' => 'int',
		'sending_id' => 'int',
		'potongan_khusus' => 'int',
		'tanggal_resi' => 'datetime',
		'kode' => 'int',
		'created_date' => 'datetime',
		'total_weight' => 'float'
	];

	protected $fillable = [
		'order_code',
		'flag_past_order',
		'user_id',
		'customer_id',
		'address_id',
		'coupon_id',
		'sub_total',
		'ongkos_kirim',
		'potongan_ongkir',
		'final_ongkir',
		'total_price',
		'upgrade_price',
		'upgrade_price_date',
		'payment_id',
		'sending_id',
		'description',
		'status',
		'nama_rekening',
		'special',
		'potongan_khusus',
		'nomor_resi',
		'tanggal_resi',
		'sumber_lead',
		'jenis_lead',
		'kode',
		'expedition',
		'note',
		'transfer_proof_url',
		'created_at',
		'total_weight',
		'is_from_aws',
		'shipping_order_id',
		'shipping_provider',
		'composite_path',
		'composite_status',
	];

	public function address()
	{
		return $this->belongsTo(Address::class);
	}

	public function coupon()
	{
		return $this->belongsTo(Coupon::class);
	}

	public function customer()
	{
		return $this->belongsTo(Customer::class);
	}

	public function payment()
	{
		return $this->belongsTo(Payment::class);
	}

	public function sending()
	{
		return $this->belongsTo(Sending::class);
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}

    public function order_photos()
    {
        return $this->hasMany(OrderPhoto::class);
    }

    public function orderPhotos()
    {
        return $this->hasMany(OrderPhoto::class);
    }

	public function return_orders()
	{
		return $this->hasMany(ReturnOrder::class);
	}

	public function transfer_proofs()
	{
		return $this->hasMany(TransferProof::class);
	}

    public function checkouts()
    {
        return $this->hasMany(Checkout::class);
    }

    /**
     * Helper to group frame requirements for uploads and display.
     * Used by check-order page (all slots per category grouped together).
     */
    public function getUploadGroupsAttribute(): array
    {
        $groups = [];

        foreach ($this->checkouts as $checkout) {
            $product  = $checkout->product;
            if (!$product) continue;

            $orderQty = $checkout->quantity;
            $frames   = [];

            foreach ($product->product_categories as $pc) {
                $category = $pc->category;
                if (!$category) continue;

                $frames[] = [
                    'category_id'   => $category->id,
                    'category_name' => $category->name,
                    'total_slots'   => $orderQty * $pc->quantity,
                ];
            }

            if (!empty($frames)) {
                $groups[] = [
                    'product_name' => $product->name,
                    'checkout_id'  => $checkout->id,
                    'frames'       => $frames,
                ];
            }
        }

        return $groups;
    }

    /**
     * Per-unit grouping for the upload-photo form.
     * Buying 2x Paket A creates 2 separate cards (Unit 1, Unit 2),
     * each with their own slots. Slot index is global (unique across units).
     */
    public function getUploadGroupsByUnitAttribute(): array
    {
        $groups = [];

        foreach ($this->checkouts as $checkout) {
            $product  = $checkout->product;
            if (!$product) continue;

            $orderQty = $checkout->quantity;

            for ($unit = 1; $unit <= $orderQty; $unit++) {
                $frames = [];

                foreach ($product->product_categories as $pc) {
                    $category = $pc->category;
                    if (!$category) continue;

                    $slotsPerUnit = $pc->quantity;
                    // Global offset ensures slot indexes are unique across units:
                    // Unit 1 → slots 1..n, Unit 2 → slots n+1..2n, etc.
                    $globalOffset = ($unit - 1) * $slotsPerUnit;

                    $frames[] = [
                        'category_id'    => $category->id,
                        'category_name'  => $category->name,
                        'slots_per_unit' => $slotsPerUnit,
                        'global_offset'  => $globalOffset,
                    ];
                }

                if (!empty($frames)) {
                    $groups[] = [
                        'product_name' => $product->name,
                        'checkout_id'  => $checkout->id,
                        'unit_number'  => $unit,
                        'total_units'  => $orderQty,
                        'frames'       => $frames,
                    ];
                }
            }
        }

        return $groups;
    }
}
